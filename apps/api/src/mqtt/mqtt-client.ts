import * as mqtt from 'mqtt'
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client'

interface TelemetryPayload {
  device_id: string
  timestamp: string | number
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
const MQTT_BROKER_URL = process.env.BROKER_URL!
const INFLUX_URL = process.env.INFLUX_URL!
const INFLUX_BUCKET = process.env.INFLUX_BUCKET!
const INFLUX_ORG = process.env.INFLUX_ORG!
const INFLUX_TOKEN = process.env.INFLUX_TOKEN!
console.log("INFLUX URL", INFLUX_URL)
const influx = new InfluxDB({
  url: INFLUX_URL,
  token: INFLUX_TOKEN,
})

const writeApi: WriteApi = influx.getWriteApi(
  INFLUX_ORG,
  INFLUX_BUCKET,
  'ms',
  {
    flushInterval: 0, // ⛔ disable auto flush
  },
)
let messageBuffer: TelemetryPayload[] = []
export const brokerSubscribe = () => {
  console.log('🔌 MQTT Service: Initializing...')

  const client = mqtt.connect(MQTT_BROKER_URL, {
    clientId: `telemetry-consumer-${Math.random()
      .toString(16)
      .substring(2, 8)}`,
    clean: true,
    reconnectPeriod: 1000,
  })

  client.on('connect', () => {
    console.log('✅ MQTT: Connected')
    client.subscribe('devices/+/telemetry', (err) => {
      if (!err) console.log('📡 Subscribed to devices/+/telemetry')
    })
  })

  client.on('message', (_, message) => {
    try {
      const payload: TelemetryPayload = JSON.parse(message.toString())
      messageBuffer.push(payload) 
      console.log(
        `[Buffer] ${payload.device_id} | size=${messageBuffer.length}`,
      )
    } catch (err) {
      console.error('⚠️ Invalid payload:', err)
    }
  })

  client.on('error', (err) => {
    console.error('❌ MQTT error:', err)
  })

  startInfluxFlushLoop()
}
const startInfluxFlushLoop = () => {
  setInterval(async () => {
    if (messageBuffer.length === 0) return

    const batch = [...messageBuffer]
    messageBuffer = []

    try {
      for (const item of batch) {
        // --- timestamp handling ---
        const ts = new Date(item.timestamp)
        if (isNaN(ts.getTime())) {
          console.warn('Invalid timestamp for device', item.device_id, item.timestamp)
          continue
        }

        // ✅ USE EXPLICIT MILLISECONDS
        const timestampMs = ts.getTime()

        const point = new Point('device_telemetry')
          .tag('device_id', item.device_id)
          .tag('status', item.status)
          .floatField('latitude', item.latitude)
          .floatField('longitude', item.longitude)
          .floatField('altitude', item.altitude)
          .floatField('speed', item.speed)
          .floatField('accuracy', item.accuracy)
          .floatField('temperature', item.temperature)
          .intField('heading', item.heading)
          .intField('satellites', item.satellites)
          .intField('battery_level', item.battery_level)
          .intField('signal_strength', item.signal_strength)
          .booleanField('charging', item.charging)
          .timestamp(timestampMs)

        writeApi.writePoint(point)
      }

      await writeApi.flush()
      console.log(`🚀 InfluxDB: Wrote ${batch.length} points`)
    } catch (err) {
      console.error('❌ Influx flush failed:', err)
      messageBuffer = [...batch, ...messageBuffer]
    }
  }, 60_000)
}
process.on('SIGINT', async () => {
  console.log('🧹 Shutting down, flushing Influx buffer...')
  await writeApi.close()
  process.exit(0)
})
