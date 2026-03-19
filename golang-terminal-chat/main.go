package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	agents "github.com/21st-dev/21st-sdk-go"
)

func loadDotenv(path string) {
	f, err := os.Open(path)
	if err != nil {
		return
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") || !strings.Contains(line, "=") {
			continue
		}
		k, v, _ := strings.Cut(line, "=")
		k = strings.TrimSpace(k)
		v = strings.Trim(strings.TrimSpace(v), "\"'")
		if k != "" && os.Getenv(k) == "" {
			os.Setenv(k, v)
		}
	}
}

func makeMessage(role, text string) agents.RunThreadMessage {
	return agents.RunThreadMessage{
		Role: role,
		Parts: []map[string]interface{}{
			{"type": "text", "text": text},
		},
	}
}

type sseEvent struct {
	Type            string                 `json:"type"`
	Delta           string                 `json:"delta,omitempty"`
	ToolName        string                 `json:"toolName,omitempty"`
	ErrorText       string                 `json:"errorText,omitempty"`
	Error           string                 `json:"error,omitempty"`
	MessageMetadata map[string]interface{} `json:"messageMetadata,omitempty"`
}

func streamResponse(resp *agents.RunThreadResult) (string, map[string]interface{}, error) {
	defer resp.Response.Body.Close()

	scanner := bufio.NewScanner(resp.Response.Body)
	scanner.Buffer(make([]byte, 1024*1024), 1024*1024)

	var textParts []string
	var metadata map[string]interface{}
	started := false

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, ":") {
			continue
		}
		if !strings.HasPrefix(line, "data: ") {
			continue
		}
		payload := line[6:]
		if payload == "[DONE]" {
			break
		}

		var event sseEvent
		if err := json.Unmarshal([]byte(payload), &event); err != nil {
			continue
		}

		switch event.Type {
		case "text-delta":
			if !started {
				fmt.Print("assistant> ")
				started = true
			}
			textParts = append(textParts, event.Delta)
			fmt.Print(event.Delta)

		case "tool-input-start":
			if started {
				fmt.Println()
				started = false
			}
			name := event.ToolName
			if name == "" {
				name = "unknown"
			}
			fmt.Printf("[tool] %s\n", name)

		case "message-metadata":
			metadata = event.MessageMetadata

		case "error":
			if started {
				fmt.Println()
			}
			errText := event.ErrorText
			if errText == "" {
				errText = event.Error
			}
			if errText == "" {
				errText = "Unknown error"
			}
			return "", nil, fmt.Errorf("%s", errText)
		}
	}

	if started {
		fmt.Println()
	}

	return strings.Join(textParts, ""), metadata, scanner.Err()
}

func printMetadata(metadata map[string]interface{}) {
	if metadata == nil {
		return
	}
	var parts []string
	if sid, ok := metadata["sessionId"].(string); ok && sid != "" {
		parts = append(parts, fmt.Sprintf("session=%s", sid))
	}
	if dur, ok := metadata["durationMs"].(float64); ok {
		parts = append(parts, fmt.Sprintf("duration=%.0fms", dur))
	}
	if cost, ok := metadata["totalCostUsd"].(float64); ok {
		parts = append(parts, fmt.Sprintf("cost=$%g", cost))
	}
	if len(parts) > 0 {
		fmt.Printf("[meta] %s\n", strings.Join(parts, " | "))
	}
}

func run() error {
	loadDotenv(".env")

	apiKey := os.Getenv("API_KEY_21ST")
	agentSlug := os.Getenv("AGENT_SLUG")
	baseURL := os.Getenv("RELAY_BASE_URL")

	if apiKey == "" {
		return fmt.Errorf("missing API key. Set API_KEY_21ST in .env")
	}
	if agentSlug == "" {
		return fmt.Errorf("missing agent slug. Set AGENT_SLUG in .env")
	}

	var opts []agents.Option
	if baseURL != "" {
		opts = append(opts, agents.WithBaseURL(baseURL))
	}
	client := agents.NewAgentClient(apiKey, opts...)

	ctx := context.Background()

	sandbox, err := client.Sandboxes.Create(ctx, &agents.CreateSandboxRequest{Agent: agentSlug})
	if err != nil {
		return fmt.Errorf("creating sandbox: %w", err)
	}

	thread, err := client.Threads.Create(ctx, sandbox.ID, "Terminal chat")
	if err != nil {
		return fmt.Errorf("creating thread: %w", err)
	}

	fmt.Printf("Connected to agent: %s\n", agentSlug)
	fmt.Printf("Sandbox: %s\n", sandbox.ID)
	fmt.Printf("Thread: %s\n", thread.ID)
	fmt.Println("Commands: /new (new thread) | /model <slug> (switch model) | /exit (quit)")
	fmt.Println()

	var messages []agents.RunThreadMessage
	var currentModel string
	reader := bufio.NewReader(os.Stdin)

	for {
		fmt.Print("you> ")
		prompt, err := reader.ReadString('\n')
		if err != nil {
			fmt.Println()
			break
		}
		prompt = strings.TrimSpace(prompt)
		if prompt == "" {
			continue
		}

		lower := strings.ToLower(prompt)
		if lower == "/exit" || lower == "/quit" || lower == "exit" || lower == "quit" {
			break
		}

		if lower == "/new" || lower == "/thread" {
			sandbox, err = client.Sandboxes.Create(ctx, &agents.CreateSandboxRequest{Agent: agentSlug})
			if err != nil {
				fmt.Fprintf(os.Stderr, "error> %v\n", err)
				continue
			}
			thread, err = client.Threads.Create(ctx, sandbox.ID, "Terminal chat")
			if err != nil {
				fmt.Fprintf(os.Stderr, "error> %v\n", err)
				continue
			}
			messages = nil
			fmt.Printf("New sandbox: %s\n", sandbox.ID)
			fmt.Printf("New thread: %s\n\n", thread.ID)
			continue
		}

		if strings.HasPrefix(lower, "/model") {
			parts := strings.TrimSpace(prompt[6:])
			if parts == "" {
				if currentModel == "" {
					fmt.Println("[model] Using default model")
				} else {
					fmt.Printf("[model] Current model: %s\n", currentModel)
				}
			} else {
				currentModel = parts
				fmt.Printf("[model] Switched to: %s\n", currentModel)
			}
			fmt.Println()
			continue
		}

		messages = append(messages, makeMessage("user", prompt))

		runReq := &agents.RunThreadRequest{
			Agent:     agentSlug,
			Messages:  messages,
			SandboxID: sandbox.ID,
			ThreadID:  thread.ID,
		}
		if currentModel != "" {
			runReq.Options = &agents.AgentRequestOptions{
				Model: currentModel,
			}
		}

		result, err := client.Threads.Run(ctx, runReq)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error> %v\n\n", err)
			continue
		}

		assistantText, metadata, err := streamResponse(result)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error> %v\n\n", err)
			continue
		}

		if assistantText != "" {
			messages = append(messages, makeMessage("assistant", assistantText))
		}

		// Refresh messages from server
		latest, err := client.Threads.Get(ctx, sandbox.ID, thread.ID)
		if err != nil {
			fmt.Fprintf(os.Stderr, "warn> failed to refresh thread: %v\n", err)
		} else if latest.Messages != nil {
			if msgSlice, ok := latest.Messages.([]interface{}); ok {
				messages = nil
				for _, m := range msgSlice {
					if b, err := json.Marshal(m); err == nil {
						var msg agents.RunThreadMessage
						if json.Unmarshal(b, &msg) == nil {
							messages = append(messages, msg)
						}
					}
				}
			}
		}

		printMetadata(metadata)
		fmt.Println()
	}

	return nil
}

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "fatal: %v\n", err)
		os.Exit(1)
	}
}
