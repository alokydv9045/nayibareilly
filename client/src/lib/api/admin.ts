import { adminApi } from './client'

export interface LeaderboardItem {
  user: { _id: string; email?: string; name?: string }
  total: number
  resolved: number
}

export const getLeaderboard = async (): Promise<LeaderboardItem[]> => {
  const { data } = await adminApi.get('/admin/leaderboard')
  return (data?.data?.items || []) as LeaderboardItem[]
}
