import React, { Activity, useEffect, useMemo, useRef, useState } from 'react'
import { Device, HistoryDataPoint } from '../types'
import {
  AlertTriangle,
  Battery,
  Bell,
  Calendar,
  ChevronLeft,
  Cpu,
  Download,
  Layers,
  MapPin,
  Settings,
  Signal,
  Thermometer,
  Wifi,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
const generateMockHistory = (deviceId: string): HistoryDataPoint[] => {
  const data: HistoryDataPoint[] = []
  const now = new Date()
  let currentLat = 23.8103
  let currentLng = 90.4125
  let battery = 85

  for (let i = 49; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60000) // Every 10 mins

    // Simulate realistic drift
    currentLat += (Math.random() - 0.5) * 0.005
    currentLng += (Math.random() - 0.5) * 0.005
    battery = Math.max(0, battery - Math.random() * 0.2)

    data.push({
      device_id: deviceId,
      timestamp: time.toISOString(),
      displayTime: time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      latitude: Number(currentLat.toFixed(6)),
      longitude: Number(currentLng.toFixed(6)),
      altitude: 12.5 + Math.random() * 2,
      speed: Number((20 + Math.random() * 30).toFixed(1)), // 20-50 km/h
      heading: Math.floor(Math.random() * 360),
      accuracy: 4.2,
      satellites: 12,
      battery_level: Math.round(battery),
      charging: false,
      signal_strength: Math.floor(-68 + Math.random() * 10 - 5),
      temperature: Number((32 + Math.random() * 5).toFixed(1)),
      status: battery < 20 ? 'low_battery' : 'active',
    })
  }
  return data
}
const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  offline: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  low_battery: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  maintenance: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
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

interface DetailViewProps {
  device: Device
  onBack: () => void
  showToast: (msg: string, type?: 'success' | 'warn' | 'info' | 'error') => void
  updateStatus: (id: string, status: string) => void
  onSettingsClick: () => void
}

const DetailView: React.FC<DetailViewProps> = React.memo(
  ({ device, onBack, showToast, updateStatus, onSettingsClick }) => {
    const [tab, setTab] = useState('overview')
    const [loadingCmd, setLoadingCmd] = useState<string | null>(null)
    const [historyData, setHistoryData] = useState<HistoryDataPoint[]>([])
    const [metric, setMetric] = useState<keyof HistoryDataPoint>('speed')

    useEffect(() => {
      setHistoryData(generateMockHistory(device.id))
    }, [device.id])

    const handleCommand = (cmdId: string, cmdLabel: string) => {
      setLoadingCmd(cmdId)
      setTimeout(() => {
        setLoadingCmd(null)
        switch (cmdId) {
          case 'ping':
            const latency = Math.floor(Math.random() * 40) + 12
            showToast(`Ping successful! Response in ${latency}ms`, 'success')
            break
          case 'reboot':
            showToast(`System reboot initiated for ${device.name}...`, 'warn')
            updateStatus(device.id, 'offline')
            setTimeout(() => {
              updateStatus(device.id, 'active')
              showToast(`${device.name} is back online`, 'success')
            }, 3000)
            break
          case 'buzzer':
            showToast(`Audible buzzer active on ${device.name}`, 'warn')
            break
          case 'lock':
            const newStatus =
              device.status === 'maintenance' ? 'active' : 'maintenance'
            updateStatus(device.id, newStatus)
            showToast(
              newStatus === 'maintenance'
                ? 'Emergency Lock Engaged'
                : 'Device Unlocked',
              newStatus === 'maintenance' ? 'warn' : 'success'
            )
            break
          default:
            showToast(`${cmdLabel} command sent successfully`, 'success')
        }
      }, 1200)
    }

    const getMetricConfig = () => {
      switch (metric) {
        case 'battery_level':
          return { label: 'Battery', color: '#10b981', unit: '%' }
        case 'signal_strength':
          return { label: 'Signal', color: '#8b5cf6', unit: 'dBm' }
        case 'temperature':
          return { label: 'Temperature', color: '#f59e0b', unit: '°C' }
        default:
          return { label: 'Speed', color: '#3b82f6', unit: 'km/h' }
      }
    }

    const metricConfig = getMetricConfig()

    const stats = useMemo(() => {
      if (!historyData.length) return { min: '0', max: '0', avg: '0' }
      // Values are typed as HistoryDataPoint values, so we might need casting if generic
      const vals = historyData.map((d) => Number(d[metric]))
      const sum = vals.reduce((a, b) => a + b, 0)
      return {
        min: Math.min(...vals).toFixed(1),
        max: Math.max(...vals).toFixed(1),
        avg: (sum / vals.length).toFixed(1),
      }
    }, [historyData, metric])

    return (
      <div className="h-full flex flex-col bg-slate-950/95 overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur border-b border-slate-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors border border-slate-700"
            >
              <ChevronLeft size={18} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-700 mx-2 hidden md:block"></div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                {device.name}
                <StatusBadge status={device.status} />
              </h2>
              <div className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Live Connection • ID: {device.id}
              </div>
            </div>
          </div>
          <button
            onClick={onSettingsClick}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="p-6 max-w-7xl mx-auto w-full">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit mb-8 shadow-inner">
            {['Overview', 'Health', 'History', 'Commands'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t.toLowerCase())}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === t.toLowerCase()
                    ? 'bg-slate-800 text-white shadow-lg shadow-black/20 ring-1 ring-white/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* ... Overview, Health, History Tabs (Same as before) ... */}
              {tab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-6 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                        Telemetry
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white tracking-tight">
                          {device.speed}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">
                          km/h
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-1000"
                        style={{ width: `${(device.speed / 120) * 100}%` }}
                      ></div>
                    </div>
                  </Card>

                  <Card className="p-6 flex flex-col justify-between">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                        Power
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-4xl font-bold tracking-tight ${device.battery < 20 ? 'text-rose-500' : 'text-emerald-500'}`}
                        >
                          {device.battery}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">
                          %
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
                      <span>
                        {device.battery > 90 ? 'Charged' : 'Discharging'}
                      </span>
                      <span>~4h remaining</span>
                    </div>
                  </Card>

                  <Card className="p-6 flex flex-col justify-between">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                        Connectivity
                      </p>
                      <div className="flex items-center gap-1.5 mb-1">
                        {[1, 2, 3, 4, 5].map((bar) => (
                          <div
                            key={bar}
                            className={`w-2 h-6 rounded-sm ${bar <= device.signal ? 'bg-blue-500' : 'bg-slate-700'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400 flex items-center gap-2">
                      <Wifi size={12} />
                      <span>4G LTE • -{85 + (5 - device.signal) * 5}dBm</span>
                    </div>
                  </Card>

                  <Card className="p-6 flex flex-col justify-between">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                        Location
                      </p>
                      <div className="flex items-center gap-2 text-white">
                        <MapPin size={20} className="text-amber-500" />
                        <span className="text-lg font-medium truncate">
                          Dhaka, BD
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 font-mono text-[10px] text-slate-500 truncate">
                      {device.lat.toFixed(6)}, {device.lng.toFixed(6)}
                    </div>
                  </Card>
                </div>
              )}

              {tab === 'health' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <Battery className="text-emerald-500" /> Battery
                      Diagnostics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-slate-400 text-sm">Voltage</span>
                        <span className="text-slate-200 font-mono">12.4 V</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-slate-400 text-sm">
                          Temperature
                        </span>
                        <span className="text-slate-200 font-mono">
                          {device.temp}°C
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-slate-400 text-sm">
                          Cycle Count
                        </span>
                        <span className="text-slate-200 font-mono">42</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-400 text-sm">
                          Health Status
                        </span>
                        <span className="text-emerald-400 font-bold text-sm">
                          GOOD (98%)
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <Cpu className="text-blue-500" /> System Metrics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-slate-400 text-sm">Uptime</span>
                        <span className="text-slate-200 font-mono">
                          14d 2h 12m
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-slate-400 text-sm">Firmware</span>
                        <span className="text-slate-200 font-mono">
                          v2.4.1-stable
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-slate-400 text-sm">
                          Memory Usage
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="w-[45%] h-full bg-blue-500"></div>
                          </div>
                          <span className="text-slate-200 text-xs font-mono">
                            45%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-400 text-sm">
                          Last Sync
                        </span>
                        <span className="text-slate-200 font-mono text-xs">
                          20ms ago
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {tab === 'history' && (
                <div className="space-y-6">
                  {/* Chart Header Controls */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                      {[
                        { id: 'speed', icon: Activity },
                        { id: 'battery_level', icon: Battery },
                        { id: 'signal_strength', icon: Signal },
                        { id: 'temperature', icon: Thermometer },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() =>
                            setMetric(m.id as keyof HistoryDataPoint)
                          }
                          className={`p-2 rounded-md flex items-center gap-2 text-xs font-medium transition-colors ${
                            metric === m.id
                              ? 'bg-slate-700 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <m.icon size={14} />
                          <span className="hidden md:inline capitalize">
                            {m.id.replace('_', ' ')}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 border border-slate-700">
                        <Calendar size={14} /> Last 8 Hours
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 border border-slate-700">
                        <Download size={14} /> Export CSV
                      </button>
                    </div>
                  </div>

                  {/* Main Chart */}
                  <Card className="p-6">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h3 className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">
                          {metricConfig.label} Trend
                        </h3>
                        <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                          {stats.avg}{' '}
                          <span className="text-sm font-normal text-slate-500">
                            {metricConfig.unit} (Avg)
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs font-mono">
                        <div className="flex flex-col items-end">
                          <span className="text-slate-500">Min</span>
                          <span className="text-white">
                            {stats.min} {metricConfig.unit}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-slate-500">Max</span>
                          <span className="text-white">
                            {stats.max} {metricConfig.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <CustomAreaChart
                      data={historyData}
                      dataKey={metric}
                      color={metricConfig.color}
                      unit={metricConfig.unit}
                    />
                  </Card>

                  {/* Raw Logs Table (Compact) */}
                  <Card className="p-0 overflow-hidden">
                    <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
                      <h3 className="text-sm font-semibold text-white">
                        Recent Data Points
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="text-slate-500 bg-slate-900/30 uppercase font-mono">
                          <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Lat/Lng</th>
                            <th className="px-4 py-3">Speed</th>
                            <th className="px-4 py-3">Battery</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {historyData.slice(0, 5).map((row, i) => (
                            <tr
                              key={i}
                              className="hover:bg-slate-800/30 transition-colors text-slate-300"
                            >
                              <td className="px-4 py-3 font-mono">
                                {row.displayTime}
                              </td>
                              <td className="px-4 py-3">
                                {row.latitude}, {row.longitude}
                              </td>
                              <td className="px-4 py-3">{row.speed} km/h</td>
                              <td className="px-4 py-3">
                                <span
                                  className={
                                    row.battery_level < 20
                                      ? 'text-red-400'
                                      : 'text-emerald-400'
                                  }
                                >
                                  {row.battery_level}%
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${row.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}
                                >
                                  {row.status.replace('_', ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {tab === 'commands' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      id: 'ping',
                      label: 'Ping Device',
                      icon: Wifi,
                      color: 'blue',
                    },
                    {
                      id: 'reboot',
                      label: 'Reboot System',
                      icon: Layers,
                      color: 'amber',
                    },
                    {
                      id: 'buzzer',
                      label: 'Sound Buzzer',
                      icon: Bell,
                      color: 'purple',
                    },
                    {
                      id: 'lock',
                      label: 'Emergency Lock',
                      icon: AlertTriangle,
                      color: 'red',
                    },
                  ].map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => handleCommand(cmd.id, cmd.label)}
                      disabled={!!loadingCmd}
                      className={`group relative overflow-hidden p-6 rounded-xl border border-slate-700/50 bg-slate-900/40 hover:bg-slate-800 transition-all flex flex-col items-center gap-3 text-center active:scale-95 ${loadingCmd === cmd.id ? 'opacity-75 cursor-wait' : ''}`}
                    >
                      <div
                        className={`p-3 rounded-full bg-${cmd.color}-500/10 text-${cmd.color}-500 group-hover:scale-110 transition-transform`}
                      >
                        {loadingCmd === cmd.id ? (
                          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <cmd.icon size={24} />
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                        {cmd.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    )
  }
)
export default DetailView
