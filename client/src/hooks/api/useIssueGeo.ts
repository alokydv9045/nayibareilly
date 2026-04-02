import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

export type IssueGeoPoint = {
  id: string
  title: string
  latitude?: number
  longitude?: number
  priority?: string
  category?: string
}

export function useIssueGeo(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ['issues', 'geo'],
    queryFn: async () => {
      const { data } = await api.get('/issues', { params: { limit: 500 } })
      type CategoryShape = string | { name?: string; _id?: string }
      type RawIssue = {
        _id?: string; id?: string; title: string; priority?: string; category?: CategoryShape; location?: { lat?: number; latitude?: number; lng?: number; longitude?: number }
      }
      const raw: RawIssue[] = (data?.data?.issues || data?.data || []) as RawIssue[]
      return raw
        .filter(r => !!r.location && (r.location?.lat || r.location?.latitude) && (r.location?.lng || r.location?.longitude))
        .map(r => ({
          id: r._id || r.id || '',
          title: r.title,
          latitude: r.location?.lat ?? r.location?.latitude,
          longitude: r.location?.lng ?? r.location?.longitude,
          priority: r.priority,
          category: typeof r.category === 'string' ? r.category : (r.category?.name || r.category?._id),
        }))
    },
    staleTime: 30_000,
  })
}
