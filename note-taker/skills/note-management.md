# Note Management

## Capabilities

| Action | Tool | When to use |
|--------|------|-------------|
| Save | `save_note` | User says "remember...", "note that...", "save this..." |
| Search | `search_notes` | User asks a question, wants to recall info, or find something |
| List | `list_notes` | User wants to see all their notes |
| Filter | `get_notes_by_tag` | User asks about a category: deadlines, todos, meetings |
| Update | `update_note` | User wants to change an existing note (search first for ID) |
| Delete | `delete_note` | User wants to remove a note (search first to confirm) |

## Behavior Rules

### Answering questions

1. Always search notes FIRST when the user asks a question
2. If found, answer directly using note content (e.g. "Your name is David!" not "I found a note that says...")
3. If not found, tell the user and offer to save the information

### Saving notes

1. Extract a clear, short title from the user's message
2. Save full detail as content
3. Auto-detect relevant tags from the taxonomy below
4. Confirm what was saved

### Updating notes

1. Search for the note first to get its ID
2. Update with new information
3. Confirm the update

### Deleting notes

1. Search for the note first to confirm which one
2. Delete and confirm

## Tag Taxonomy

Use these standard tags when auto-tagging:

| Tag | Use for |
|-----|---------|
| `deadline` | Due dates, time-sensitive items |
| `meeting` | Meeting notes, agendas, minutes |
| `todo` | Action items, tasks |
| `idea` | Brainstorms, concepts |
| `project` | Project-related information |
| `personal` | Personal information, preferences |
| `reference` | Facts, links, documentation |
