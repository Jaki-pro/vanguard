import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import mqtt from 'mqtt'

const BROKER_URL = process.env.BROKER_URL! 
export const telemetrySimulation = (device_id:string) => {
    const TOPIC = `devices/${device_id}/telemetry`
  const client = mqtt.connect(BROKER_URL, {
    reconnectPeriod: 3000,
  })

  client.on('connect', () => {
    console.log('✅ Connected to MQTT broker')
    setInterval(() => {
      const payload = {
        device_id: device_id,
        timestamp: new Date().toISOString(),
        latitude: 23.810331 + (Math.random() - 0.5) * 0.001,
        longitude: 90.412521 + (Math.random() - 0.5) * 0.001,
        altitude: 12.5,
        speed: Number((40 + Math.random() * 10).toFixed(2)),
        heading: Math.floor(Math.random() * 360),
        accuracy: Number((3 + Math.random() * 2).toFixed(2)),
        satellites: Math.floor(10 + Math.random() * 5),
        battery_level: Math.floor(60 + Math.random() * 40),
        charging: Math.random() > 0.5,
        signal_strength: -60 - Math.floor(Math.random() * 15),
        temperature: Number((30 + Math.random() * 5).toFixed(1)),
        status: 'active',
      }

      client.publish(TOPIC, JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) {
          console.error('Publish error:', err)
          return
        }
        // console.log('📡 Published:', payload)
      })
    }, 5000)
  })

  client.on('error', (err) => {
    console.error('MQTT error:', err)
  })
}
