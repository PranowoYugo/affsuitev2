export interface ViralPost {
  postId: string
  type: string
  created: string
  createdTs: number | null
  likes: number
  comments: number
  shares: number
  postUrl: string
  content: string
  imageUrl: string
  /** likes + 2*comments + 3*shares */
  score: number
}

export type SortKey = 'score' | 'likes' | 'comments' | 'shares' | 'newest' | 'oldest'
