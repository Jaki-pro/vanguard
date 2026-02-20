'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Save, X } from 'lucide-react'
import { Device } from '../types'
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
export default DeviceSettingsModal
