import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  notes: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .searchIndex("search_title", { searchField: "title" })
    .searchIndex("search_content", { searchField: "content" }),
})
