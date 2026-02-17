// 'use client'
// import { useEffect, useState } from 'react'
// import client from '../lib/client'

// export default function Home() {
//   const [msg, setMsg] = useState('')

//   useEffect(() => {
//     const fetchData = async () => {
//       // This is type-safe. If you change 'json' to 'form' in backend, this errors.
//       const res = await client.hello.$post({
//         json: { name: 'Next.js Developer' },
//       })
//       const data = await res.json()
//       setMsg(data.message)
//     }
//     fetchData()
//   }, [])

//   if (!msg) return <p>Loading...</p>
//   return <h1>Backend says: {msg}</h1>
// }

'use client'
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Battery, Wifi, Thermometer, Activity, Navigation, Search, 
  Bell, Menu, X, ChevronLeft, Zap, Settings, Radio, 
  Layers, AlertTriangle, CheckCircle, Clock, MapPin, Signal, Cpu,
  Calendar, Download, RefreshCw, Info, Trash2, Plus, Save, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// --- TYPES ---

interface Device {
  id: string;
  name: string;
  type: string; // 'drone' | 'vehicle' | 'bike' | 'sensor' | 'boat' | 'station'
  status: string; // 'active' | 'offline' | 'low_battery' | 'maintenance'
  lat: number;
  lng: number;
  battery: number;
  speed: number;
  signal: number;
  temp: number;
  history: { lat: number; lng: number }[];
}

interface HistoryDataPoint {
  device_id: string;
  timestamp: string;
  displayTime: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  satellites: number;
  battery_level: number;
  charging: boolean;
  signal_strength: number;
  temperature: number;
  status: string;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warn' | 'success' | 'error';
}

interface ToastMessage {
  msg: string;
  type: 'success' | 'warn' | 'info' | 'error';
}

// --- CONSTANTS & CONFIG ---

const TILE_SIZE = 256;
const DHAKA_LAT = 23.7937;
const DHAKA_LNG = 90.4066;
const DEFAULT_ZOOM = 13;

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  offline: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  low_battery: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  maintenance: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
};

// --- UTILS ---

const lat2y = (lat: number): number => (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2;
const lng2x = (lng: number): number => (lng + 180) / 360;
const y2lat = (y: number): number => {
  const n = Math.PI * (1 - 2 * y);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

const latLngToPixel = (lat: number, lng: number, zoom: number, centerLat: number, centerLng: number, containerWidth: number, containerHeight: number) => {
  const scale = Math.pow(2, zoom) * TILE_SIZE;
  const x = (lng2x(lng) * scale) - (lng2x(centerLng) * scale) + (containerWidth / 2);
  const y = (lat2y(lat) * scale) - (lat2y(centerLat) * scale) + (containerHeight / 2);
  return { x, y };
};

// --- MOCK DATA GENERATORS ---

const generateInitialDevices = (): Device[] => [
  { id: 'DEV-001', name: 'Alpha Drone', type: 'drone', status: 'active', lat: 23.7937, lng: 90.4066, battery: 82, speed: 45, signal: 4, temp: 34, history: [] },
  { id: 'DEV-002', name: 'Logistics Truck A', type: 'vehicle', status: 'active', lat: 23.8103, lng: 90.4125, battery: 65, speed: 22, signal: 3, temp: 40, history: [] },
  { id: 'DEV-003', name: 'Gulshan Courier', type: 'bike', status: 'low_battery', lat: 23.7806, lng: 90.4193, battery: 18, speed: 12, signal: 2, temp: 31, history: [] },
  { id: 'DEV-004', name: 'Sensor Array X1', type: 'sensor', status: 'offline', lat: 23.7500, lng: 90.3900, battery: 0, speed: 0, signal: 0, temp: 28, history: [] },
  { id: 'DEV-005', name: 'River Boat Patrol', type: 'boat', status: 'active', lat: 23.7600, lng: 90.4500, battery: 92, speed: 15, signal: 4, temp: 29, history: [] },
  { id: 'DEV-006', name: 'Uttara Node', type: 'station', status: 'maintenance', lat: 23.8700, lng: 90.3800, battery: 100, speed: 0, signal: 5, temp: 36, history: [] },
];

const generateMockHistory = (deviceId: string): HistoryDataPoint[] => {
  const data: HistoryDataPoint[] = [];
  const now = new Date();
  let currentLat = 23.8103;
  let currentLng = 90.4125;
  let battery = 85;

  for (let i = 49; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60000); // Every 10 mins
    
    // Simulate realistic drift
    currentLat += (Math.random() - 0.5) * 0.005;
    currentLng += (Math.random() - 0.5) * 0.005;
    battery = Math.max(0, battery - (Math.random() * 0.2));

    data.push({
      device_id: deviceId,
      timestamp: time.toISOString(),
      displayTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
    });
  }
  return data;
};

// --- COMPONENTS ---

// 1. Toast Notification
interface ToastProps {
  message: string;
  type: 'success' | 'warn' | 'info' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgClass = type === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-100' 
                : type === 'warn' ? 'bg-amber-500/10 border-amber-500 text-amber-100'
                : 'bg-blue-500/10 border-blue-500 text-blue-100';
  
  const Icon = type === 'success' ? CheckCircle : type === 'warn' ? AlertTriangle : Info;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${bgClass}`}
    >
      <Icon size={20} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={14} /></button>
    </motion.div>
  );
};

// 2. Custom Chart
interface CustomAreaChartProps {
  data: HistoryDataPoint[];
  dataKey: keyof HistoryDataPoint;
  color?: string;
  unit?: string;
}

const CustomAreaChart: React.FC<CustomAreaChartProps> = ({ data, dataKey, color = "#3b82f6", unit = "" }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!data || data.length === 0) return null;

  // We cast to number assuming dataKey points to a numeric field
  const values = data.map(d => Number(d[dataKey]));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const height = 200;
  const width = 600; // viewBox width

  // Create path points
  const points = values.map((val, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((val - min) / range) * (height * 0.8) - (height * 0.1); // padding
    return `${x},${y}`;
  }).join(' ');

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const index = Math.min(
      Math.max(0, Math.floor((x / rect.width) * data.length)),
      data.length - 1
    );
    setHoverIndex(index);
  };

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
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid Lines */}
        <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.5" />
        <line x1="0" y1={height * 0.50} x2={width} y2={height * 0.50} stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.5" />
        <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.5" />

        {/* Area Fill */}
        <path d={`M${points.split(' ')[0]} ${points} V ${height} H 0 Z`} fill={`url(#gradient-${dataKey})`} />
        
        {/* Line Stroke */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Hover Effects */}
        {hoverIndex !== null && (
          <>
             <line x1={(hoverIndex / (data.length - 1)) * width} y1="0" x2={(hoverIndex / (data.length - 1)) * width} y2={height} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3"/>
             <circle cx={(hoverIndex / (data.length - 1)) * width} cy={height - ((values[hoverIndex]! - min) / range) * (height * 0.8) - (height * 0.1)} r="4" fill="#fff" stroke={color} strokeWidth="2" />
          </>
        )}
      </svg>
      
      {hoverIndex !== null && (
        <div 
          className="absolute top-0 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-800/90 backdrop-blur border border-slate-700 p-2 rounded-lg shadow-xl z-10"
          style={{ left: `${(hoverIndex / (data.length - 1)) * 100}%`, top: '10%' }}
        >
          <div className="text-xs text-slate-400 mb-1">{data[hoverIndex]!.displayTime}</div>
          <div className="text-sm font-bold text-white">
            {values[hoverIndex]} <span className="text-xs font-normal text-slate-400">{unit}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. Reusable UI Components
const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const StatusBadge: React.FC<{ status: string }> = React.memo(({ status }) => {
  const styles = STATUS_COLORS[status] || STATUS_COLORS.offline;
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'animate-pulse bg-current' : 'bg-current'}`} />
      {status.replace('_', ' ')}
    </span>
  );
});

// 4. Add Device Modal
interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; type: string; id: string }) => void;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ name: '', type: 'vehicle', id: '' });

  useEffect(() => {
    if(isOpen) setFormData({ name: '', type: 'vehicle', id: '' });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

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
        <p className="text-xs text-slate-400 mb-6">Register a new unit to the tracking network.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Device Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
              placeholder="e.g. Logistics Truck B"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Device ID (Optional)</label>
            <input 
              type="text" 
              value={formData.id}
              onChange={e => setFormData({...formData, id: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 font-mono"
              placeholder="Leave empty to auto-generate"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Device Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['vehicle', 'drone', 'bike', 'boat', 'sensor', 'station'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, type})}
                  className={`px-2 py-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                    formData.type === type 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
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
  );
};

// 5. Device Settings Modal
interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
  onSave: (device: Device) => void;
}

const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({ isOpen, onClose, device, onSave }) => {
  const [formData, setFormData] = useState({ name: '', type: 'vehicle', status: 'active' });

  useEffect(() => {
    if(isOpen && device) {
      setFormData({ name: device.name, type: device.type, status: device.status });
    }
  }, [isOpen, device]);

  if (!isOpen || !device) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...device, ...formData });
  };

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
        <p className="text-xs text-slate-400 mb-6">Configuration for <span className="font-mono text-blue-400">{device.id}</span></p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Device Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Operational Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
              <option value="low_battery">Low Battery</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Device Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['vehicle', 'drone', 'bike', 'boat', 'sensor', 'station'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, type})}
                  className={`px-2 py-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                    formData.type === type 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
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
  );
};

// --- SUB-VIEWS ---

interface DetailViewProps {
  device: Device;
  onBack: () => void;
  showToast: (msg: string, type?: 'success' | 'warn' | 'info' | 'error') => void;
  updateStatus: (id: string, status: string) => void;
  onSettingsClick: () => void;
}

const DetailView: React.FC<DetailViewProps> = React.memo(({ device, onBack, showToast, updateStatus, onSettingsClick }) => {
  const [tab, setTab] = useState('overview');
  const [loadingCmd, setLoadingCmd] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistoryDataPoint[]>([]);
  const [metric, setMetric] = useState<keyof HistoryDataPoint>('speed');

  useEffect(() => {
    setHistoryData(generateMockHistory(device.id));
  }, [device.id]);

  const handleCommand = (cmdId: string, cmdLabel: string) => {
    setLoadingCmd(cmdId);
    setTimeout(() => {
      setLoadingCmd(null);
      switch(cmdId) {
        case 'ping':
          const latency = Math.floor(Math.random() * 40) + 12;
          showToast(`Ping successful! Response in ${latency}ms`, 'success');
          break;
        case 'reboot':
          showToast(`System reboot initiated for ${device.name}...`, 'warn');
          updateStatus(device.id, 'offline');
          setTimeout(() => {
            updateStatus(device.id, 'active');
            showToast(`${device.name} is back online`, 'success');
          }, 3000);
          break;
        case 'buzzer':
          showToast(`Audible buzzer active on ${device.name}`, 'warn');
          break;
        case 'lock':
          const newStatus = device.status === 'maintenance' ? 'active' : 'maintenance';
          updateStatus(device.id, newStatus);
          showToast(
            newStatus === 'maintenance' ? 'Emergency Lock Engaged' : 'Device Unlocked', 
            newStatus === 'maintenance' ? 'warn' : 'success'
          );
          break;
        default:
          showToast(`${cmdLabel} command sent successfully`, 'success');
      }
    }, 1200);
  };

  const getMetricConfig = () => {
    switch(metric) {
      case 'battery_level': return { label: 'Battery', color: '#10b981', unit: '%' };
      case 'signal_strength': return { label: 'Signal', color: '#8b5cf6', unit: 'dBm' };
      case 'temperature': return { label: 'Temperature', color: '#f59e0b', unit: '°C' };
      default: return { label: 'Speed', color: '#3b82f6', unit: 'km/h' };
    }
  };
  
  const metricConfig = getMetricConfig();
  
  const stats = useMemo(() => {
    if (!historyData.length) return { min: "0", max: "0", avg: "0" };
    // Values are typed as HistoryDataPoint values, so we might need casting if generic
    const vals = historyData.map(d => Number(d[metric]));
    const sum = vals.reduce((a, b) => a + b, 0);
    return {
      min: Math.min(...vals).toFixed(1),
      max: Math.max(...vals).toFixed(1),
      avg: (sum / vals.length).toFixed(1)
    };
  }, [historyData, metric]);

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
          {['Overview', 'Health', 'History', 'Commands'].map(t => (
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
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* ... Overview, Health, History Tabs (Same as before) ... */}
            {tab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <Card className="p-6 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <div>
                       <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Telemetry</p>
                       <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white tracking-tight">{device.speed}</span>
                          <span className="text-sm text-slate-500 font-medium">km/h</span>
                       </div>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(device.speed / 120) * 100}%` }}></div>
                    </div>
                 </Card>

                 <Card className="p-6 flex flex-col justify-between">
                    <div>
                       <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Power</p>
                       <div className="flex items-baseline gap-1">
                          <span className={`text-4xl font-bold tracking-tight ${device.battery < 20 ? 'text-rose-500' : 'text-emerald-500'}`}>{device.battery}</span>
                          <span className="text-sm text-slate-500 font-medium">%</span>
                       </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
                       <span>{device.battery > 90 ? 'Charged' : 'Discharging'}</span>
                       <span>~4h remaining</span>
                    </div>
                 </Card>

                 <Card className="p-6 flex flex-col justify-between">
                    <div>
                       <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Connectivity</p>
                       <div className="flex items-center gap-1.5 mb-1">
                          {[1,2,3,4,5].map(bar => (
                             <div key={bar} className={`w-2 h-6 rounded-sm ${bar <= device.signal ? 'bg-blue-500' : 'bg-slate-700'}`} />
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
                       <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Location</p>
                       <div className="flex items-center gap-2 text-white">
                          <MapPin size={20} className="text-amber-500" />
                          <span className="text-lg font-medium truncate">Dhaka, BD</span>
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
                      <Battery className="text-emerald-500" /> Battery Diagnostics
                    </h3>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center py-2 border-b border-slate-800">
                          <span className="text-slate-400 text-sm">Voltage</span>
                          <span className="text-slate-200 font-mono">12.4 V</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-slate-800">
                          <span className="text-slate-400 text-sm">Temperature</span>
                          <span className="text-slate-200 font-mono">{device.temp}°C</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-slate-800">
                          <span className="text-slate-400 text-sm">Cycle Count</span>
                          <span className="text-slate-200 font-mono">42</span>
                       </div>
                       <div className="flex justify-between items-center py-2">
                          <span className="text-slate-400 text-sm">Health Status</span>
                          <span className="text-emerald-400 font-bold text-sm">GOOD (98%)</span>
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
                          <span className="text-slate-200 font-mono">14d 2h 12m</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-slate-800">
                          <span className="text-slate-400 text-sm">Firmware</span>
                          <span className="text-slate-200 font-mono">v2.4.1-stable</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-slate-800">
                          <span className="text-slate-400 text-sm">Memory Usage</span>
                          <div className="flex items-center gap-2">
                             <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="w-[45%] h-full bg-blue-500"></div>
                             </div>
                             <span className="text-slate-200 text-xs font-mono">45%</span>
                          </div>
                       </div>
                       <div className="flex justify-between items-center py-2">
                          <span className="text-slate-400 text-sm">Last Sync</span>
                          <span className="text-slate-200 font-mono text-xs">20ms ago</span>
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
                       ].map(m => (
                         <button
                           key={m.id}
                           onClick={() => setMetric(m.id as keyof HistoryDataPoint)}
                           className={`p-2 rounded-md flex items-center gap-2 text-xs font-medium transition-colors ${
                             metric === m.id ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
                           }`}
                         >
                           <m.icon size={14} />
                           <span className="hidden md:inline capitalize">{m.id.replace('_', ' ')}</span>
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
                         <h3 className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">{metricConfig.label} Trend</h3>
                         <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                           {stats.avg} <span className="text-sm font-normal text-slate-500">{metricConfig.unit} (Avg)</span>
                         </div>
                       </div>
                       <div className="flex gap-4 text-xs font-mono">
                          <div className="flex flex-col items-end">
                            <span className="text-slate-500">Min</span>
                            <span className="text-white">{stats.min} {metricConfig.unit}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-slate-500">Max</span>
                            <span className="text-white">{stats.max} {metricConfig.unit}</span>
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
                       <h3 className="text-sm font-semibold text-white">Recent Data Points</h3>
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
                               <tr key={i} className="hover:bg-slate-800/30 transition-colors text-slate-300">
                                  <td className="px-4 py-3 font-mono">{row.displayTime}</td>
                                  <td className="px-4 py-3">{row.latitude}, {row.longitude}</td>
                                  <td className="px-4 py-3">{row.speed} km/h</td>
                                  <td className="px-4 py-3">
                                    <span className={row.battery_level < 20 ? 'text-red-400' : 'text-emerald-400'}>{row.battery_level}%</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${row.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
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
                   { id: 'ping', label: 'Ping Device', icon: Wifi, color: 'blue' },
                   { id: 'reboot', label: 'Reboot System', icon: Layers, color: 'amber' },
                   { id: 'buzzer', label: 'Sound Buzzer', icon: Bell, color: 'purple' },
                   { id: 'lock', label: 'Emergency Lock', icon: AlertTriangle, color: 'red' },
                 ].map((cmd) => (
                   <button 
                     key={cmd.id} 
                     onClick={() => handleCommand(cmd.id, cmd.label)}
                     disabled={!!loadingCmd}
                     className={`group relative overflow-hidden p-6 rounded-xl border border-slate-700/50 bg-slate-900/40 hover:bg-slate-800 transition-all flex flex-col items-center gap-3 text-center active:scale-95 ${loadingCmd === cmd.id ? 'opacity-75 cursor-wait' : ''}`}
                   >
                     <div className={`p-3 rounded-full bg-${cmd.color}-500/10 text-${cmd.color}-500 group-hover:scale-110 transition-transform`}>
                       {loadingCmd === cmd.id ? <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <cmd.icon size={24} />}
                     </div>
                     <span className="text-sm font-medium text-slate-300 group-hover:text-white">{cmd.label}</span>
                   </button>
                 ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

// --- CUSTOM OSM MAP COMPONENT ---

interface CustomOSMMapProps {
  devices: Device[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const CustomOSMMap: React.FC<CustomOSMMapProps> = ({ devices, selectedId, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [viewport, setViewport] = useState({ lat: DHAKA_LAT, lng: DHAKA_LNG, zoom: DEFAULT_ZOOM });
  const [hasInitialFit, setHasInitialFit] = useState(false);
  
  // DRAG STATES
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const viewportStartRef = useRef({ lat: 0, lng: 0 });

  // Handle resize
  useEffect(() => {
    const updateDim = () => {
      if(containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', updateDim);
    updateDim();
    return () => window.removeEventListener('resize', updateDim);
  }, []);

  // CENTER ON SELECTED DEVICE
  useEffect(() => {
    if (selectedId) {
      const device = devices.find(d => d.id === selectedId);
      if (device) {
        setViewport(prev => ({
          ...prev,
          lat: device.lat,
          lng: device.lng,
          zoom: Math.max(prev.zoom, 15)
        }));
      }
    }
  }, [selectedId, devices]);

  // FIT BOUNDS ON MOUNT
  useEffect(() => {
    if (devices.length > 0 && !hasInitialFit && dimensions.width > 0) {
      const lats = devices.map(d => d.lat);
      const lngs = devices.map(d => d.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;

      // Heuristic for Zoom Level
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;
      const maxDiff = Math.max(latDiff, lngDiff);
      
      let newZoom = 13;
      if (maxDiff > 0.5) newZoom = 9;
      else if (maxDiff > 0.2) newZoom = 10;
      else if (maxDiff > 0.1) newZoom = 11;
      else if (maxDiff > 0.05) newZoom = 12;

      setViewport({ lat: centerLat, lng: centerLng, zoom: newZoom });
      setHasInitialFit(true);
    }
  }, [devices, dimensions, hasInitialFit]);

  // WHEEL ZOOM HANDLER
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY === 0) return;
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(3, Math.min(18, prev.zoom + (e.deltaY > 0 ? -1 : 1)))
    }));
  }, []);

  // DRAG HANDLERS
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    viewportStartRef.current = { lat: viewport.lat, lng: viewport.lng };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    // Scale: Pixels per world width
    const scale = Math.pow(2, viewport.zoom) * TILE_SIZE;
    
    // Convert current viewport center to normalized Mercator coordinates (0-1)
    // We must use the start position to calculate the new position
    const startX = lng2x(viewportStartRef.current.lng);
    const startY = lat2y(viewportStartRef.current.lat);
    
    // Calculate new normalized coordinates
    // Moving mouse Right (positive dx) means we want to see what is to the Left, 
    // so we shift the Center coordinate to the Left (negative change)
    const newX = startX - (dx / scale);
    const newY = startY - (dy / scale);
    
    // Convert back to Lat/Lng
    const newLat = y2lat(newY);
    const newLng = newX * 360 - 180;
    
    setViewport(prev => ({ ...prev, lat: newLat, lng: newLng }));
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const renderTiles = useMemo(() => {
    const tiles = [];
    const scale = Math.pow(2, viewport.zoom);
    const centerX = lng2x(viewport.lng) * scale;
    const centerY = lat2y(viewport.lat) * scale;
    const numTilesX = Math.ceil(dimensions.width / TILE_SIZE) + 2;
    const numTilesY = Math.ceil(dimensions.height / TILE_SIZE) + 2;
    const startTileX = Math.floor(centerX - (dimensions.width / 2 / TILE_SIZE));
    const startTileY = Math.floor(centerY - (dimensions.height / 2 / TILE_SIZE));
    const offsetX = (startTileX * TILE_SIZE) - (centerX * TILE_SIZE) + (dimensions.width / 2);
    const offsetY = (startTileY * TILE_SIZE) - (centerY * TILE_SIZE) + (dimensions.height / 2);

    for (let x = 0; x < numTilesX; x++) {
      for (let y = 0; y < numTilesY; y++) {
        const tileX = startTileX + x;
        const tileY = startTileY + y;
        const max = Math.pow(2, viewport.zoom);
        const normalizedX = ((tileX % max) + max) % max;
        
        if (tileY >= 0 && tileY < max) {
          tiles.push(
            <img
              key={`${viewport.zoom}-${tileX}-${tileY}`}
              src={`https://a.tile.openstreetmap.org/${viewport.zoom}/${normalizedX}/${tileY}.png`}
              alt="map tile"
              loading="eager"
              className="absolute pointer-events-none select-none"
              style={{
                left: offsetX + (x * TILE_SIZE),
                top: offsetY + (y * TILE_SIZE),
                width: TILE_SIZE,
                height: TILE_SIZE,
                willChange: 'transform',
              }}
            />
          );
        }
      }
    }
    return tiles;
  }, [viewport, dimensions]);

  return (
    <div 
      ref={containerRef} 
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full bg-[#F3F4F6] overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* 1. Map Tiles Layer - No filters for cleaner look */}
      <div className="absolute inset-0 bg-[#F3F4F6] z-0">
         {renderTiles}
      </div>

      {/* 2. Attribution */}
      <div className="absolute bottom-1 right-1 z-10 text-[10px] text-slate-500 bg-white/80 backdrop-blur px-2 py-0.5 rounded shadow pointer-events-none">
        &copy; <a href="https://www.openstreetmap.org/copyright" className="hover:underline">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" className="hover:underline">CARTO</a>
      </div>

      {/* 3. Devices Layer */}
      {devices.map(device => {
        const { x, y } = latLngToPixel(device.lat, device.lng, viewport.zoom, viewport.lat, viewport.lng, dimensions.width, dimensions.height);
        
        if (x < -50 || y < -50 || x > dimensions.width + 50 || y > dimensions.height + 50) return null;

        const isSelected = selectedId === device.id;
        const color = device.status === 'active' ? 'bg-emerald-500' : device.status === 'offline' ? 'bg-rose-500' : 'bg-amber-500';

        return (
          <motion.div
            key={device.id}
            initial={false}
            animate={{ left: x, top: y }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            onClick={(e) => { e.stopPropagation(); onSelect(device.id); }}
          >
             <AnimatePresence>
              {(isSelected || device.status === 'active') && (
                <motion.div 
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: -30 }}
                   className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 border border-slate-700 px-2 py-1 rounded text-[10px] font-bold text-white shadow-lg pointer-events-none z-30 ${isSelected ? 'scale-110 border-emerald-500/50' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  {device.name}
                </motion.div>
              )}
             </AnimatePresence>

            <div className={`relative ${isSelected ? 'scale-125' : ''} transition-transform`}>
              {device.status === 'active' && (
                <div className={`absolute inset-0 rounded-full ${color} animate-ping opacity-75 h-4 w-4`}></div>
              )}
              <div className={`relative h-4 w-4 rounded-full border-2 border-white shadow-md ${color}`}></div>
            </div>
          </motion.div>
        );
      })}

      {/* 4. Controls */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-30">
        <button 
          onClick={() => setViewport(p => ({ ...p, zoom: Math.min(p.zoom + 1, 18) }))}
          className="w-10 h-10 bg-slate-800/90 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center font-bold shadow-lg backdrop-blur"
        >
          +
        </button>
        <button 
          onClick={() => setViewport(p => ({ ...p, zoom: Math.max(p.zoom - 1, 5) }))}
          className="w-10 h-10 bg-slate-800/90 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center font-bold shadow-lg backdrop-blur"
        >
          -
        </button>
      </div>
    </div>
  );
};

// --- MEMOIZED SIDEBAR ITEM ---

interface SidebarItemProps {
  device: Device;
  isSelected: boolean;
  onClick: () => void;
  onViewDetails: (id: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = React.memo(({ device, isSelected, onClick, onViewDetails }) => (
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
        <div className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
            {device.type === 'drone' ? <Navigation size={16} /> : <Radio size={16} />}
        </div>
        <div className="overflow-hidden">
          <h4 className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>{device.name}</h4>
          <p className="text-[10px] text-slate-400 font-mono tracking-wide truncate">{device.id}</p>
        </div>
      </div>
      <StatusBadge status={device.status} />
    </div>
    
    <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1"><Battery size={12} className={device.battery < 20 ? "text-red-400" : ""} /> {device.battery}%</span>
        <span className="flex items-center gap-1"><Activity size={12} /> {device.speed} <span className="text-[9px]">km/h</span></span>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onViewDetails(device.id); }}
        className={`text-xs font-medium px-2 py-1 rounded hover:bg-blue-500/20 transition-colors ${isSelected ? 'text-blue-300' : 'text-slate-500 hover:text-blue-400'}`}
      >
        Details
      </button>
    </div>
  </div>
));

// --- MAIN APPLICATION ---

export default function App() {
  const [devices, setDevices] = useState<Device[]>(generateInitialDevices);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'detail'>('dashboard'); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Responsive Sidebar Initialization
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // NOTIFICATION STATE
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: 'System Online', message: 'Dashboard initialized successfully.', time: 'Just now', type: 'info' },
    { id: 2, title: 'Maintenance Alert', message: 'Uttara Node requires firmware update.', time: '2h ago', type: 'warn' },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addNotification = (title: string, message: string, type: 'info' | 'warn' | 'success' | 'error' = 'info') => {
    const newNotif: NotificationItem = { id: Date.now(), title, message, time: 'Just now', type };
    setNotifications(prev => [newNotif, ...prev].slice(0, 10)); 
  };

  const showToast = useCallback((msg: string, type: 'success' | 'warn' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // CRUD HANDLERS
  const handleAddDevice = (data: { name: string; type: string; id: string }) => {
    const newId = data.id || `DEV-${Math.floor(Math.random() * 9000) + 1000}`;
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
      history: []
    };
    setDevices(prev => [...prev, newDevice]);
    showToast(`Device ${data.name} added successfully!`, 'success');
    setIsAddDeviceOpen(false);
  };

  const handleUpdateDevice = (updatedDevice: Device) => {
    setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    showToast(`Configuration for ${updatedDevice.name} updated`, 'success');
    setIsSettingsOpen(false);
  };

  const handleUpdateStatus = useCallback((id: string, status: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  }, []);
  
  // Real-time Simulation Loop
  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
    const interval = setInterval(() => {
      setDevices(prev => prev.map(d => {
        if (d.status === 'offline') return d;
        if (Math.random() < 0.02 && d.battery < 15) {
           addNotification('Low Battery Warning', `${d.name} is at ${d.battery}%`, 'warn');
        }
        return {
          ...d,
          lat: d.lat + (Math.random() - 0.5) * 0.001,
          lng: d.lng + (Math.random() - 0.5) * 0.001,
          battery: d.battery > 0 ? parseFloat((d.battery - 0.1).toFixed(1)) : 0,
          speed: Math.floor(Math.max(0, d.speed + (Math.random() - 0.5) * 5)),
          history: d.history 
        };
      }));
    }, 2000); 
    return () => clearInterval(interval);
  }, []);

  const handleDeviceSelect = useCallback((id: string) => {
    setSelectedId(id);
    if (window.innerWidth < 1024) setSidebarOpen(false); 
  }, []);

  const handleViewDetails = useCallback((id: string) => {
    setSelectedId(id);
    setView('detail');
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  const activeDevice = useMemo(() => 
    devices.find(d => d.id === selectedId) || devices[0]
  , [devices, selectedId]);

  if (loading) return <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-slate-500">Loading System...</div>;

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>
      
      {/* 1. PERSISTENT SIDEBAR */}
      {/* Removed AnimatePresence wrapper to prevent exit animation delay */}
      {(sidebarOpen) && (
          <motion.aside 
            initial={{ x: -320 }} 
            animate={{ x: 0 }} 
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col shadow-2xl lg:relative lg:translate-x-0"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/50">
              <Link href="/"  className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                  <Activity className="text-white" size={20} />
                </div> 
                <span className="font-bold text-lg tracking-tight text-white">TrackFlow</span>
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
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-slate-800 rounded-md text-slate-400">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-700/30">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter units..." 
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Device List (Memoized Items) */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {devices.map(device => (
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">A</div>
                  <div>
                    <div className="text-xs font-medium text-white">Admin Console</div>
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
                 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
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
            <div className="absolute top-4 right-4 z-30 flex gap-2" ref={notifRef}>
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
                         <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</h3>
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
                             <Bell size={24} className="mx-auto mb-2 opacity-20" />
                             No new notifications
                           </div>
                         ) : (
                           <div className="divide-y divide-slate-800/50">
                             {notifications.map((n) => (
                               <div key={n.id} className="p-3 hover:bg-slate-800/50 transition-colors flex gap-3">
                                 <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'warn' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                 <div>
                                   <div className="flex justify-between items-start w-full">
                                     <h4 className="text-sm font-medium text-slate-200">{n.title}</h4>
                                     <span className="text-[10px] text-slate-600 ml-2 whitespace-nowrap">{n.time}</span>
                                   </div>
                                   <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
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
            device={activeDevice} 
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
            device={activeDevice}
            onSave={handleUpdateDevice}
          />
        )}
      </AnimatePresence>
    </div>
  );
}