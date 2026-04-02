"use client"
import 'leaflet/dist/leaflet.css'
// Type issues between React 19 types and react-leaflet; cast locally to any to avoid blocking build
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapContainer as RLMapContainer, TileLayer as RLTileLayer, Marker as RLMarker, Popup as RLPopup, Circle as RLCircle, useMapEvents } from 'react-leaflet'
// Lightweight dynamic clustering: Instead of adding heavy plugin immediately, implement a simple manual cluster grouping by proximity radius

type Cluster = { id: string; center: [number, number]; points: MarkerData[] }

export type MarkerData = { id: string | number; name: string; position: [number, number]; color?: string; priority?: string; category?: string }

type LeafletMapProps = {
  center: [number, number]
  zoom?: number
  markers?: MarkerData[]
  onClick?: (lat: number, lng: number) => void
  showUserLocation?: boolean
  cluster?: boolean
  clusterRadiusMeters?: number
}

type MapClickEvent = { latlng: { lat: number; lng: number } }

function ClickCatcher({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: MapClickEvent) {
      if (onClick) onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function buildClusters(markers: MarkerData[], radiusMeters: number): Cluster[] {
  if (!markers.length) return []
  const R = 6371000 // Earth radius
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const distance = (a: [number, number], b: [number, number]) => {
    const [lat1, lon1] = a
    const [lat2, lon2] = b
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const s1 = Math.sin(dLat / 2)
    const s2 = Math.sin(dLon / 2)
    const aa = s1 * s1 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * s2 * s2
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
    return R * c
  }
  const clusters: Cluster[] = []
  for (const m of markers) {
    let target: Cluster | undefined
    for (const c of clusters) {
      if (distance(c.center, m.position) <= radiusMeters) {
        target = c
        break
      }
    }
    if (!target) clusters.push({ id: String(m.id), center: m.position, points: [m] })
    else {
      target.points.push(m)
      // Recompute centroid
      const lat = target.points.reduce((s, p) => s + p.position[0], 0) / target.points.length
      const lng = target.points.reduce((s, p) => s + p.position[1], 0) / target.points.length
      target.center = [lat, lng]
    }
  }
  return clusters
}

export default function LeafletMap({ center, zoom = 12, markers = [], onClick, showUserLocation: _showUserLocation = false, cluster = false, clusterRadiusMeters = 120 }: LeafletMapProps) {
  // use the react-leaflet components directly in JSX

  // Derive clusters if enabled
  const clusters = cluster ? buildClusters(markers, clusterRadiusMeters) : []

  // Browser geolocation (client-only)
  // (Geolocation placeholder removed for now; to be implemented with state in parent or via effect)

  return (
    <RLMapContainer {...({ center, zoom, style: { height: '100%', width: '100%' } } as any)}>
      <ClickCatcher onClick={onClick} />
    <RLTileLayer {...({ attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' } as any)} />
      {!cluster && markers.map((m) => (
        <RLMarker key={String(m.id)} position={m.position}>
          <RLPopup>
            <div className="space-y-1">
              <p className="font-semibold text-sm">{m.name}</p>
              {m.category && <p className="text-xs opacity-70">{m.category}</p>}
              {m.priority && <span className="badge badge-xs">{m.priority}</span>}
            </div>
          </RLPopup>
        </RLMarker>
      ))}
      {cluster && clusters.map(c => (
        c.points.length === 1 ? (
          <RLMarker key={c.id} position={c.center}>
            <RLPopup>{c.points[0].name}</RLPopup>
          </RLMarker>
        ) : (
          <RLCircle key={c.id} {...({ center: c.center, radius: 120, pathOptions: { color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.75 } } as any)}>
            <RLPopup>
              <div className="text-sm font-medium">{c.points.length} issues</div>
            </RLPopup>
          </RLCircle>
        )
      ))}
      {/* User location marker to be added later when geolocation implemented */}
  </RLMapContainer>
  )
}
