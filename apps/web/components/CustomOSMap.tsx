'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Device } from '../types'
import { AnimatePresence, motion } from 'framer-motion'

interface CustomOSMMapProps {
  devices: Device[]
  selectedId: string | null
  onSelect: (id: string) => void
}
const lat2y = (lat: number): number =>
  (1 -
    Math.log(
      Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
    ) /
      Math.PI) /
  2
const lng2x = (lng: number): number => (lng + 180) / 360
const y2lat = (y: number): number => {
  const n = Math.PI * (1 - 2 * y)
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}
const TILE_SIZE = 256
const DHAKA_LAT = 23.7937
const DHAKA_LNG = 90.4066
const DEFAULT_ZOOM = 13
const latLngToPixel = (
  lat: number,
  lng: number,
  zoom: number,
  centerLat: number,
  centerLng: number,
  containerWidth: number,
  containerHeight: number
) => {
  const scale = Math.pow(2, zoom) * TILE_SIZE
  const x = lng2x(lng) * scale - lng2x(centerLng) * scale + containerWidth / 2
  const y = lat2y(lat) * scale - lat2y(centerLat) * scale + containerHeight / 2
  return { x, y }
}
const CustomOSMMap: React.FC<CustomOSMMapProps> = ({
  devices,
  selectedId,
  onSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [viewport, setViewport] = useState({
    lat: DHAKA_LAT,
    lng: DHAKA_LNG,
    zoom: DEFAULT_ZOOM,
  })
  const [hasInitialFit, setHasInitialFit] = useState(false)

  // DRAG STATES
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const viewportStartRef = useRef({ lat: 0, lng: 0 })

  // Handle resize
  useEffect(() => {
    const updateDim = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    window.addEventListener('resize', updateDim)
    updateDim()
    return () => window.removeEventListener('resize', updateDim)
  }, [])

  // CENTER ON SELECTED DEVICE
  useEffect(() => {
    if (selectedId) {
      const device = devices.find((d) => d.id === selectedId)
      if (device) {
        setViewport((prev) => ({
          ...prev,
          lat: device.lat,
          lng: device.lng,
          zoom: Math.max(prev.zoom, 15),
        }))
      }
    }
  }, [selectedId, devices])

  // FIT BOUNDS ON MOUNT
  useEffect(() => {
    if (devices.length > 0 && !hasInitialFit && dimensions.width > 0) {
      const lats = devices.map((d) => d.lat)
      const lngs = devices.map((d) => d.lng)
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLng = Math.min(...lngs)
      const maxLng = Math.max(...lngs)

      const centerLat = (minLat + maxLat) / 2
      const centerLng = (minLng + maxLng) / 2

      // Heuristic for Zoom Level
      const latDiff = maxLat - minLat
      const lngDiff = maxLng - minLng
      const maxDiff = Math.max(latDiff, lngDiff)

      let newZoom = 13
      if (maxDiff > 0.5) newZoom = 9
      else if (maxDiff > 0.2) newZoom = 10
      else if (maxDiff > 0.1) newZoom = 11
      else if (maxDiff > 0.05) newZoom = 12

      setViewport({ lat: centerLat, lng: centerLng, zoom: newZoom })
      setHasInitialFit(true)
    }
  }, [devices, dimensions, hasInitialFit])

  // WHEEL ZOOM HANDLER
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY === 0) return
    setViewport((prev) => ({
      ...prev,
      zoom: Math.max(3, Math.min(18, prev.zoom + (e.deltaY > 0 ? -1 : 1))),
    }))
  }, [])

  // DRAG HANDLERS
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    viewportStartRef.current = { lat: viewport.lat, lng: viewport.lng }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y

    // Scale: Pixels per world width
    const scale = Math.pow(2, viewport.zoom) * TILE_SIZE

    // Convert current viewport center to normalized Mercator coordinates (0-1)
    // We must use the start position to calculate the new position
    const startX = lng2x(viewportStartRef.current.lng)
    const startY = lat2y(viewportStartRef.current.lat)

    // Calculate new normalized coordinates
    // Moving mouse Right (positive dx) means we want to see what is to the Left,
    // so we shift the Center coordinate to the Left (negative change)
    const newX = startX - dx / scale
    const newY = startY - dy / scale

    // Convert back to Lat/Lng
    const newLat = y2lat(newY)
    const newLng = newX * 360 - 180

    setViewport((prev) => ({ ...prev, lat: newLat, lng: newLng }))
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

  const renderTiles = useMemo(() => {
    const tiles = []
    const scale = Math.pow(2, viewport.zoom)
    const centerX = lng2x(viewport.lng) * scale
    const centerY = lat2y(viewport.lat) * scale
    const numTilesX = Math.ceil(dimensions.width / TILE_SIZE) + 2
    const numTilesY = Math.ceil(dimensions.height / TILE_SIZE) + 2
    const startTileX = Math.floor(centerX - dimensions.width / 2 / TILE_SIZE)
    const startTileY = Math.floor(centerY - dimensions.height / 2 / TILE_SIZE)
    const offsetX =
      startTileX * TILE_SIZE - centerX * TILE_SIZE + dimensions.width / 2
    const offsetY =
      startTileY * TILE_SIZE - centerY * TILE_SIZE + dimensions.height / 2

    for (let x = 0; x < numTilesX; x++) {
      for (let y = 0; y < numTilesY; y++) {
        const tileX = startTileX + x
        const tileY = startTileY + y
        const max = Math.pow(2, viewport.zoom)
        const normalizedX = ((tileX % max) + max) % max

        if (tileY >= 0 && tileY < max) {
          tiles.push(
            <img
              key={`${viewport.zoom}-${tileX}-${tileY}`}
              src={`https://a.tile.openstreetmap.org/${viewport.zoom}/${normalizedX}/${tileY}.png`}
              alt="map tile"
              loading="eager"
              className="absolute pointer-events-none select-none"
              style={{
                left: offsetX + x * TILE_SIZE,
                top: offsetY + y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                willChange: 'transform',
              }}
            />
          )
        }
      }
    }
    return tiles
  }, [viewport, dimensions])

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
      <div className="absolute inset-0 bg-[#F3F4F6] z-0">{renderTiles}</div>

      {/* 2. Attribution */}
      <div className="absolute bottom-1 right-1 z-10 text-[10px] text-slate-500 bg-white/80 backdrop-blur px-2 py-0.5 rounded shadow pointer-events-none">
        &copy;{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          className="hover:underline"
        >
          OpenStreetMap
        </a>{' '}
        &copy;{' '}
        <a href="https://carto.com/attributions" className="hover:underline">
          CARTO
        </a>
      </div>

      {/* 3. Devices Layer */}
      {devices.map((device) => {
        const { x, y } = latLngToPixel(
          device.lat,
          device.lng,
          viewport.zoom,
          viewport.lat,
          viewport.lng,
          dimensions.width,
          dimensions.height
        )

        if (
          x < -50 ||
          y < -50 ||
          x > dimensions.width + 50 ||
          y > dimensions.height + 50
        )
          return null

        const isSelected = selectedId === device.id
        const color =
          device.status === 'active'
            ? 'bg-emerald-500'
            : device.status === 'offline'
              ? 'bg-rose-500'
              : 'bg-amber-500'

        return (
          <motion.div
            key={device.id}
            initial={false}
            animate={{ left: x, top: y }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(device.id)
            }}
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

            <div
              className={`relative ${isSelected ? 'scale-125' : ''} transition-transform`}
            >
              {device.status === 'active' && (
                <div
                  className={`absolute inset-0 rounded-full ${color} animate-ping opacity-75 h-4 w-4`}
                ></div>
              )}
              <div
                className={`relative h-4 w-4 rounded-full border-2 border-white shadow-md ${color}`}
              ></div>
            </div>
          </motion.div>
        )
      })}

      {/* 4. Controls */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-30">
        <button
          onClick={() =>
            setViewport((p) => ({ ...p, zoom: Math.min(p.zoom + 1, 18) }))
          }
          className="w-10 h-10 bg-slate-800/90 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center font-bold shadow-lg backdrop-blur"
        >
          +
        </button>
        <button
          onClick={() =>
            setViewport((p) => ({ ...p, zoom: Math.max(p.zoom - 1, 5) }))
          }
          className="w-10 h-10 bg-slate-800/90 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center font-bold shadow-lg backdrop-blur"
        >
          -
        </button>
      </div>
    </div>
  )
}
export default CustomOSMMap
