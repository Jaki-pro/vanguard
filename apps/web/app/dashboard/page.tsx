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
import AddDeviceModal from '../../components/AddDeviceModal'
import DeviceSettingsModal from '../../components/DeviceSettingsModal'
import { useAuth } from '../../hooks/use-auth'
import { useDeviceTelemetry } from '../../hooks/useDeviceTelemetry'

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  offline: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  low_battery: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  maintenance: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
}

// --- HELPERS ---

/** Map signal_strength (dBm, typically -30 to -90) to 0–5 scale */
const signalToBar = (dbm: number): number => {
  if (dbm >= -55) return 5
  if (dbm >= -65) return 4
  if (dbm >= -75) return 3
  if (dbm >= -85) return 2
  return 1
}

/** Derive status: if battery < 20 and not charging → low_battery */
const deriveStatus = (
  raw: string,
  battery: number,
  charging: boolean
): string => {
  if (raw === 'offline') return 'offline'
  if (battery < 20 && !charging) return 'low_battery'
  return raw
}

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

type UserDevice = {
  id: number
  deviceId: number
  type: string
  userId: string
  deviceName: string
}

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<'dashboard' | 'detail'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { isAuthenticated, isLoading, user } = useAuth()
  const [apiDevices, setApiDevices] = useState<UserDevice[]>([])

  // Responsive Sidebar Initialization
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    handleResize()
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
  const handleAddDevice = async (data: { type: string; id: string }) => {
    const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL + '/devices/assign'
    const newDevice = {
      deviceId: parseInt(data.id, 10),
      userId: user?.id,
      type: data.type,
    }
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to assign device')
      }
      showToast(`Device ${newDevice.deviceId} added successfully!`, 'success')
      setIsAddDeviceOpen(false)
      // Re-fetch devices so new device appears
      fetchDevices()
    } catch (error: any) {
      showToast(
        error.message || 'Network error: Could not add device.',
        'error'
      )
    }
  }

  const fetchDevices = useCallback(async () => {
    if (!user?.id) return
    const API_BASE = 'http://localhost:3001'
    try {
      const res = await fetch(`${API_BASE}/devices/user/${user.id}`)
      if (!res.ok) throw new Error('Failed to fetch devices')
      const result = await res.json()
      const rawData: UserDevice[] = result.data || result
      setApiDevices(rawData)
    } catch (error: any) {
      showToast(error.message || 'Failed to load your devices', 'error')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      fetchDevices()
    }
  }, [user?.id, fetchDevices])

  // Real-time telemetry from custom hook (keyed by deviceId number)
  const telemetryData = useDeviceTelemetry(apiDevices)

  // --- CORE: Derive Device[] from telemetry + apiDevices metadata ---
  const devices = useMemo<Device[]>(() => {
    if (!apiDevices.length) return []

    return apiDevices.map((apiDev) => {
      const telemetry = telemetryData[apiDev.deviceId]

      // If no telemetry yet, show device as offline with defaults
      if (!telemetry) {
        return {
          id: String(apiDev.deviceId),
          name: apiDev.deviceName || `Device ${apiDev.deviceId}`,
          type: apiDev.type || 'sensor',
          status: 'offline',
          lat: 0,
          lng: 0,
          battery: 0,
          speed: 0,
          signal: 0,
          temp: 0,
          history: [],
        }
      }

      const battery = telemetry.battery_level ?? 0
      const charging = telemetry.charging ?? false
      const rawStatus: string = telemetry.status ?? 'offline'
      const status: string = deriveStatus(rawStatus, battery, charging)

      // Emit low battery notification (side-effect safe: only on status derived)
      if (status === 'low_battery') {
        // We can't call addNotification in useMemo — handled in useEffect below
      }

      return {
        id: String(apiDev.deviceId),
        name: apiDev.deviceName || `Device ${apiDev.deviceId}`,
        type: apiDev.type || 'sensor',
        status,
        lat: telemetry.latitude ?? 0,
        lng: telemetry.longitude ?? 0,
        battery,
        speed: Math.round(telemetry.speed ?? 0),
        signal: signalToBar(telemetry.signal_strength ?? -90),
        temp: telemetry.temperature ?? 0,
        altitude: telemetry.altitude,
        heading: telemetry.heading,
        satellites: telemetry.satellites,
        accuracy: telemetry.accuracy,
        charging,
        history: [],
      }
    })
  }, [apiDevices, telemetryData])
  console.log('Derived devices => ', devices)
  // Low battery notifications (derived from devices, side-effect safe)
  const prevLowBatteryRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    devices.forEach((d) => {
      if (d.status === 'low_battery' && !prevLowBatteryRef.current.has(d.id)) {
        addNotification(
          'Low Battery Warning',
          `${d.name} is at ${d.battery}%`,
          'warn'
        )
        prevLowBatteryRef.current.add(d.id)
      }
      if (d.status !== 'low_battery') {
        prevLowBatteryRef.current.delete(d.id)
      }
    })
  }, [devices])

  // handleUpdateDevice: optimistic local override (settings saved)
  // Since devices are derived from telemetry, overrides reset on next telemetry tick.
  // For name/type we update apiDevices (or POST to API); for status we track overrides.
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, string>
  >({})

  const handleUpdateDevice = (updatedDevice: Device) => {
    // Persist name/type changes via API if needed; here we optimistically update apiDevices
    setApiDevices((prev) =>
      prev.map((d) =>
        String(d.deviceId) === updatedDevice.id
          ? { ...d, deviceName: updatedDevice.name, type: updatedDevice.type }
          : d
      )
    )
    showToast(`Configuration for ${updatedDevice.name} updated`, 'success')
    setIsSettingsOpen(false)
  }

  const handleUpdateStatus = useCallback((id: string, status: string) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }))
  }, [])
  console.log('Status overrides => ', statusOverrides)
  // Apply status overrides on top of telemetry-derived devices
  const devicesWithOverrides = useMemo<Device[]>(
    () =>
      devices.map((d) => {
        const override = statusOverrides[d.id]
        return override ? { ...d, status: override } : d // override is narrowed to string here
      }),
    [devices, statusOverrides]
  )
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
    () =>
      devicesWithOverrides.find((d) => d.id === selectedId) ||
      devicesWithOverrides[0],
    [devicesWithOverrides, selectedId]
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

      {/* SIDEBAR */}
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-y-0 left-0 z-50 w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col shadow-2xl lg:relative lg:translate-x-0"
        >
          <div className="p-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/50">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Activity className="text-white" size={20} />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                VanGuard
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
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hidden lg:block"
                title="Collapse Sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-slate-800 rounded-md text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
          </div>

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

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {devicesWithOverrides.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No devices found. Add a device to get started.
              </div>
            ) : (
              devicesWithOverrides.map((device) => (
                <SidebarItem
                  key={device.id}
                  device={device}
                  isSelected={selectedId === device.id}
                  onClick={() => handleDeviceSelect(device.id)}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>

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

      {/* MAIN CONTENT */}
      <main className="flex-1 relative flex flex-col h-full bg-slate-950">
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

        {view === 'dashboard' ? (
          <div className="w-full h-full relative">
            <CustomOSMMap
              devices={devicesWithOverrides}
              selectedId={selectedId}
              onSelect={handleDeviceSelect}
            />

            <div
              className="absolute top-4 right-4 z-30 flex gap-2"
              ref={notifRef}
            >
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

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddDeviceOpen && (
          <AddDeviceModal
            isOpen={isAddDeviceOpen}
            onClose={() => setIsAddDeviceOpen(false)}
            onAdd={handleAddDevice}
          />
        )}
      </AnimatePresence>

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
