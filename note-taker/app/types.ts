export interface ThreadItem {
  id: string
  name?: string | null
  status: string
  createdAt: string
}

export interface Note {
  _id: string
  _creationTime: number
  title: string
  content: string
  tags: string[]
  createdAt: number
  updatedAt: number
}
