export interface Device {
  id: string
  name: string
  type: string // 'drone' | 'vehicle' | 'bike' | 'sensor' | 'boat' | 'station'
  status: string // 'active' | 'offline' | 'low_battery' | 'maintenance'
  lat: number
  lng: number
  battery: number
  speed: number
  signal: number
  temp: number
  history: { lat: number; lng: number }[]
}

export interface HistoryDataPoint {
  device_id: string
  timestamp: string
  displayTime: string
  latitude: number
  longitude: number
  altitude: number
  speed: number
  heading: number
  accuracy: number
  satellites: number
  battery_level: number
  charging: boolean
  signal_strength: number
  temperature: number
  status: string
}

export interface NotificationItem {
  id: number
  title: string
  message: string
  time: string
  type: 'info' | 'warn' | 'success' | 'error'
}

export interface ToastMessage {
  msg: string
  type: 'success' | 'warn' | 'info' | 'error'
}
