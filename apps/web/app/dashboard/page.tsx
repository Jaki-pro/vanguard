'use client'
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Battery,
  Activity,
  Navigation,
  Search,
  Bell,
  Menu,
  X,
  Radio,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  Plus,
  Save,
  PanelLeftClose,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Device,
  HistoryDataPoint,
  NotificationItem,
  ToastMessage,
} from '../../types'
import CustomOSMMap from '../../components/CustomOSMap'
import DetailView from '../../components/DetailView'

const TILE_SIZE = 256
const DHAKA_LAT = 23.7937
const DHAKA_LNG = 90.4066
const DEFAULT_ZOOM = 13

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  offline: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  low_battery: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  maintenance: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
}

// --- MOCK DATA GENERATORS ---
const generateInitialDevices = (): Device[] => [
  {
    id: 'DEV-001',
    name: 'Alpha Drone',
    type: 'drone',
    status: 'active',
    lat: 23.7937,
    lng: 90.4066,
    battery: 82,
    speed: 45,
    signal: 4,
    temp: 34,
    history: [],
  },
  {
    id: 'DEV-002',
    name: 'Logistics Truck A',
    type: 'vehicle',
    status: 'active',
    lat: 23.8103,
    lng: 90.4125,
    battery: 65,
    speed: 22,
    signal: 3,
    temp: 40,
    history: [],
  },
  {
    id: 'DEV-003',
    name: 'Gulshan Courier',
    type: 'bike',
    status: 'low_battery',
    lat: 23.7806,
    lng: 90.4193,
    battery: 18,
    speed: 12,
    signal: 2,
    temp: 31,
    history: [],
  },
  {
    id: 'DEV-004',
    name: 'Sensor Array X1',
    type: 'sensor',
    status: 'offline',
    lat: 23.75,
    lng: 90.39,
    battery: 0,
    speed: 0,
    signal: 0,
    temp: 28,
    history: [],
  },
  {
    id: 'DEV-005',
    name: 'River Boat Patrol',
    type: 'boat',
    status: 'active',
    lat: 23.76,
    lng: 90.45,
    battery: 92,
    speed: 15,
    signal: 4,
    temp: 29,
    history: [],
  },
  {
    id: 'DEV-006',
    name: 'Uttara Node',
    type: 'station',
    status: 'maintenance',
    lat: 23.87,
    lng: 90.38,
    battery: 100,
    speed: 0,
    signal: 5,
    temp: 36,
    history: [],
  },
]

interface ToastProps {
  message: string
  type: 'success' | 'warn' | 'info' | 'error'
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgClass =
    type === 'success'
      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-100'
      : type === 'warn'
        ? 'bg-amber-500/10 border-amber-500 text-amber-100'
        : 'bg-blue-500/10 border-blue-500 text-blue-100'

  const Icon =
    type === 'success' ? CheckCircle : type === 'warn' ? AlertTriangle : Info

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${bgClass}`}
    >
      <Icon size={20} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X size={14} />
      </button>
    </motion.div>
  )
}

// 2. Custom Chart
interface CustomAreaChartProps {
  data: HistoryDataPoint[]
  dataKey: keyof HistoryDataPoint
  color?: string
  unit?: string
}

const CustomAreaChart: React.FC<CustomAreaChartProps> = ({
  data,
  dataKey,
  color = '#3b82f6',
  unit = '',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  if (!data || data.length === 0) return null

  // We cast to number assuming dataKey points to a numeric field
  const values = data.map((d) => Number(d[dataKey]))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const height = 200
  const width = 600 // viewBox width

  // Create path points
  const points = values
    .map((val, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - ((val - min) / range) * (height * 0.8) - height * 0.1 // padding
      return `${x},${y}`
    })
    .join(' ')

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const index = Math.min(
      Math.max(0, Math.floor((x / rect.width) * data.length)),
      data.length - 1
    )
    setHoverIndex(index)
  }

  return (
    <div className="relative w-full h-[250px] bg-slate-900/50 rounded-xl border border-slate-800 p-4 select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient
            id={`gradient-${dataKey}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        <line
          x1="0"
          y1={height * 0.25}
          x2={width}
          y2={height * 0.25}
          stroke="#334155"
          strokeWidth="0.5"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        <line
          x1="0"
          y1={height * 0.5}
          x2={width}
          y2={height * 0.5}
          stroke="#334155"
          strokeWidth="0.5"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        <line
          x1="0"
          y1={height * 0.75}
          x2={width}
          y2={height * 0.75}
          stroke="#334155"
          strokeWidth="0.5"
          strokeDasharray="4 4"
          opacity="0.5"
        />

        {/* Area Fill */}
        <path
          d={`M${points.split(' ')[0]} ${points} V ${height} H 0 Z`}
          fill={`url(#gradient-${dataKey})`}
        />

        {/* Line Stroke */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover Effects */}
        {hoverIndex !== null && (
          <>
            <line
              x1={(hoverIndex / (data.length - 1)) * width}
              y1="0"
              x2={(hoverIndex / (data.length - 1)) * width}
              y2={height}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={(hoverIndex / (data.length - 1)) * width}
              cy={
                height -
                ((values[hoverIndex]! - min) / range) * (height * 0.8) -
                height * 0.1
              }
              r="4"
              fill="#fff"
              stroke={color}
              strokeWidth="2"
            />
          </>
        )}
      </svg>

      {hoverIndex !== null && (
        <div
          className="absolute top-0 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-800/90 backdrop-blur border border-slate-700 p-2 rounded-lg shadow-xl z-10"
          style={{
            left: `${(hoverIndex / (data.length - 1)) * 100}%`,
            top: '10%',
          }}
        >
          <div className="text-xs text-slate-400 mb-1">
            {data[hoverIndex]!.displayTime}
          </div>
          <div className="text-sm font-bold text-white">
            {values[hoverIndex]}{' '}
            <span className="text-xs font-normal text-slate-400">{unit}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// 3. Reusable UI Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden ${className}`}
  >
    {children}
  </div>
)

const StatusBadge: React.FC<{ status: string }> = React.memo(({ status }) => {
  const styles = STATUS_COLORS[status] || STATUS_COLORS.offline
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${styles}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'animate-pulse bg-current' : 'bg-current'}`}
      />
      {status.replace('_', ' ')}
    </span>
  )
})

// 4. Add Device Modal
interface AddDeviceModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: { name: string; type: string; id: string }) => void
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'vehicle',
    id: '',
  })

  useEffect(() => {
    if (isOpen) setFormData({ name: '', type: 'vehicle', id: '' })
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Add New Device</h2>
        <p className="text-xs text-slate-400 mb-6">
          Register a new unit to the tracking network.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Device Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
              placeholder="e.g. Logistics Truck B"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Device ID (Optional)
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 font-mono"
              placeholder="Leave empty to auto-generate"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Device Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['vehicle', 'drone', 'bike', 'boat', 'sensor', 'station'].map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`px-2 py-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                      formData.type === type
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 mt-4 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Register Device
          </button>
        </form>
      </motion.div>
    </div>
  )
}

// 5. Device Settings Modal
interface DeviceSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  device: Device
  onSave: (device: Device) => void
}

const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  isOpen,
  onClose,
  device,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'vehicle',
    status: 'active',
  })

  useEffect(() => {
    if (isOpen && device) {
      setFormData({
        name: device.name,
        type: device.type,
        status: device.status,
      })
    }
  }, [isOpen, device])

  if (!isOpen || !device) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...device, ...formData })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Device Settings</h2>
        <p className="text-xs text-slate-400 mb-6">
          Configuration for{' '}
          <span className="font-mono text-blue-400">{device.id}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Device Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Operational Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
              <option value="low_battery">Low Battery</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Device Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['vehicle', 'drone', 'bike', 'boat', 'sensor', 'station'].map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`px-2 py-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                      formData.type === type
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 mt-4 flex items-center justify-center gap-2"
          >
            <Save size={18} /> Save Changes
          </button>
        </form>
      </motion.div>
    </div>
  )
}

// --- MEMOIZED SIDEBAR ITEM ---

interface SidebarItemProps {
  device: Device
  isSelected: boolean
  onClick: () => void
  onViewDetails: (id: string) => void
}

const SidebarItem: React.FC<SidebarItemProps> = React.memo(
  ({ device, isSelected, onClick, onViewDetails }) => (
    <div
      onClick={onClick}
      className={`group p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
        isSelected
          ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-900/20'
          : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/40 hover:border-slate-600'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}
          >
            {device.type === 'drone' ? (
              <Navigation size={16} />
            ) : (
              <Radio size={16} />
            )}
          </div>
          <div className="overflow-hidden">
            <h4
              className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}
            >
              {device.name}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide truncate">
              {device.id}
            </p>
          </div>
        </div>
        <StatusBadge status={device.status} />
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Battery
              size={12}
              className={device.battery < 20 ? 'text-red-400' : ''}
            />{' '}
            {device.battery}%
          </span>
          <span className="flex items-center gap-1">
            <Activity size={12} /> {device.speed}{' '}
            <span className="text-[9px]">km/h</span>
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails(device.id)
          }}
          className={`text-xs font-medium px-2 py-1 rounded hover:bg-blue-500/20 transition-colors ${isSelected ? 'text-blue-300' : 'text-slate-500 hover:text-blue-400'}`}
        >
          Details
        </button>
      </div>
    </div>
  )
)

export default function App() {
  const [devices, setDevices] = useState<Device[]>(generateInitialDevices)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<'dashboard' | 'detail'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Responsive Sidebar Initialization
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    handleResize() // Init
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // NOTIFICATION STATE
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: 'System Online',
      message: 'Dashboard initialized successfully.',
      time: 'Just now',
      type: 'info',
    },
    {
      id: 2,
      title: 'Maintenance Alert',
      message: 'Uttara Node requires firmware update.',
      time: '2h ago',
      type: 'warn',
    },
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addNotification = (
    title: string,
    message: string,
    type: 'info' | 'warn' | 'success' | 'error' = 'info'
  ) => {
    const newNotif: NotificationItem = {
      id: Date.now(),
      title,
      message,
      time: 'Just now',
      type,
    }
    setNotifications((prev) => [newNotif, ...prev].slice(0, 10))
  }

  const showToast = useCallback(
    (msg: string, type: 'success' | 'warn' | 'info' | 'error' = 'success') => {
      setToast({ msg, type })
      setTimeout(() => setToast(null), 3500)
    },
    []
  )

  // CRUD HANDLERS
  const handleAddDevice = (data: {
    name: string
    type: string
    id: string
  }) => {
    const newId = data.id || `DEV-${Math.floor(Math.random() * 9000) + 1000}`
    const newDevice: Device = {
      id: newId,
      name: data.name,
      type: data.type,
      status: 'active',
      lat: DHAKA_LAT + (Math.random() - 0.5) * 0.02,
      lng: DHAKA_LNG + (Math.random() - 0.5) * 0.02,
      battery: 100,
      speed: 0,
      signal: 5,
      temp: 30,
      history: [],
    }
    setDevices((prev) => [...prev, newDevice])
    showToast(`Device ${data.name} added successfully!`, 'success')
    setIsAddDeviceOpen(false)
  }

  const handleUpdateDevice = (updatedDevice: Device) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d))
    )
    showToast(`Configuration for ${updatedDevice.name} updated`, 'success')
    setIsSettingsOpen(false)
  }

  const handleUpdateStatus = useCallback((id: string, status: string) => {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)))
  }, [])

  // Real-time Simulation Loop
  useEffect(() => {
    setTimeout(() => setLoading(false), 800)
    const interval = setInterval(() => {
      setDevices((prev) =>
        prev.map((d) => {
          if (d.status === 'offline') return d
          if (Math.random() < 0.02 && d.battery < 15) {
            addNotification(
              'Low Battery Warning',
              `${d.name} is at ${d.battery}%`,
              'warn'
            )
          }
          return {
            ...d,
            lat: d.lat + (Math.random() - 0.5) * 0.001,
            lng: d.lng + (Math.random() - 0.5) * 0.001,
            battery:
              d.battery > 0 ? parseFloat((d.battery - 0.1).toFixed(1)) : 0,
            speed: Math.floor(Math.max(0, d.speed + (Math.random() - 0.5) * 5)),
            history: d.history,
          }
        })
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleDeviceSelect = useCallback((id: string) => {
    setSelectedId(id)
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }, [])

  const handleViewDetails = useCallback((id: string) => {
    setSelectedId(id)
    setView('detail')
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }, [])

  const activeDevice = useMemo(
    () => devices.find((d) => d.id === selectedId) || devices[0],
    [devices, selectedId]
  )

  if (loading)
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-slate-500">
        Loading System...
      </div>
    )

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>

      {/* 1. PERSISTENT SIDEBAR */}
      {/* Removed AnimatePresence wrapper to prevent exit animation delay */}
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-y-0 left-0 z-50 w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col shadow-2xl lg:relative lg:translate-x-0"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/50">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Activity className="text-white" size={20} />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                TrackFlow
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsAddDeviceOpen(true)}
                className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 rounded-lg transition-colors"
                title="Add Device"
              >
                <Plus size={18} />
              </button>
              {/* Desktop Collapse Button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hidden lg:block"
                title="Collapse Sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
              {/* Mobile Close Button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-slate-800 rounded-md text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-700/30">
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-slate-500"
                size={14}
              />
              <input
                type="text"
                placeholder="Filter units..."
                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Device List (Memoized Items) */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {devices.map((device) => (
              <SidebarItem
                key={device.id}
                device={device}
                isSelected={selectedId === device.id}
                onClick={() => handleDeviceSelect(device.id)}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* User Footer */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                A
              </div>
              <div>
                <div className="text-xs font-medium text-white">
                  Admin Console
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  System Online
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 relative flex flex-col h-full bg-slate-950">
        {/* Mobile/Desktop Header Toggle */}
        <div className="absolute top-4 left-4 z-40">
          <AnimatePresence>
            {!sidebarOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setSidebarOpen(true)}
                className="p-2 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg shadow-lg text-white hover:bg-slate-800 transition-colors"
              >
                <Menu size={20} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* View Switcher */}
        {view === 'dashboard' ? (
          <div className="w-full h-full relative">
            <CustomOSMMap
              devices={devices}
              selectedId={selectedId}
              onSelect={handleDeviceSelect}
            />

            {/* Quick Stats & Notification Overlay */}
            <div
              className="absolute top-4 right-4 z-30 flex gap-2"
              ref={notifRef}
            >
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-lg text-white shadow-xl transition-all ${showNotifications ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/20' : 'hover:bg-slate-800'}`}
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right"
                    >
                      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900/50">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Notifications
                        </h3>
                        <button
                          onClick={() => setNotifications([])}
                          className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={10} /> Clear
                        </button>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 text-xs">
                            <Bell
                              size={24}
                              className="mx-auto mb-2 opacity-20"
                            />
                            No new notifications
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-800/50">
                            {notifications.map((n) => (
                              <div
                                key={n.id}
                                className="p-3 hover:bg-slate-800/50 transition-colors flex gap-3"
                              >
                                <div
                                  className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'warn' ? 'bg-amber-500' : 'bg-blue-500'}`}
                                />
                                <div>
                                  <div className="flex justify-between items-start w-full">
                                    <h4 className="text-sm font-medium text-slate-200">
                                      {n.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-600 ml-2 whitespace-nowrap">
                                      {n.time}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                    {n.message}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : (
          <DetailView
            device={activeDevice!}
            onBack={() => setView('dashboard')}
            showToast={showToast}
            updateStatus={handleUpdateStatus}
            onSettingsClick={() => setIsSettingsOpen(true)}
          />
        )}
      </main>

      {/* GLOBAL TOAST NOTIFICATION CONTAINER */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* ADD DEVICE MODAL */}
      <AnimatePresence>
        {isAddDeviceOpen && (
          <AddDeviceModal
            isOpen={isAddDeviceOpen}
            onClose={() => setIsAddDeviceOpen(false)}
            onAdd={handleAddDevice}
          />
        )}
      </AnimatePresence>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <DeviceSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            device={activeDevice!}
            onSave={handleUpdateDevice}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
