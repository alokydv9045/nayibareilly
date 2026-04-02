import { api } from './client'

export interface IssuesQuery {
  page?: number
  limit?: number
  q?: string
  status?: string
  category?: string
  sort?: 'newest' | 'oldest' | 'votes'
}

export interface CategoryRef { _id: string; name: string; color?: string; icon?: string }
export interface IssueSummary {
  _id: string
  title: string
  description: string
  createdAt: string
  status: string
  votes?: number
  category?: CategoryRef
  images?: string[]
}

export interface PaginatedIssues {
  items: IssueSummary[]
  total: number
  page: number
  pages: number
}

export const getIssues = async (params: IssuesQuery = {}): Promise<PaginatedIssues> => {
  const { data } = await api.get('/issues', { params })
  return data?.data as PaginatedIssues
}

export const getIssue = async (id: string) => {
  const { data } = await api.get(`/issues/${id}`)
  return data?.data?.issue
}

export const trackIssueByReportId = async (reportId: string) => {
  const { data } = await api.get(`/issues/track/${encodeURIComponent(reportId)}`)
  return data?.data?.issue
}

export const createIssue = async (form: FormData) => {
  const { data } = await api.post('/issues', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data?.data?.issue
}

export const voteIssue = async (id: string) => {
  const { data } = await api.post(`/issues/${id}/vote`)
  return data?.data
}

export const getVoteStatus = async (id: string): Promise<{ hasVoted: boolean }> => {
  const { data } = await api.get(`/issues/${id}/vote`)
  return (data?.data || { hasVoted: false }) as { hasVoted: boolean }
}

export const myIssues = async () => {
  const { data } = await api.get('/issues/my-issues')
  return data?.data?.items
}

export interface CategoryItem { _id: string; name: string; description?: string; icon?: string; color?: string }
export const getCategories = async (): Promise<CategoryItem[]> => {
  const { data } = await api.get('/issues/categories')
  return (data?.data?.items || []) as CategoryItem[]
}
