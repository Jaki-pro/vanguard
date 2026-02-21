import { useEffect, useRef, useState } from 'react'
import mqtt, { MqttClient } from 'mqtt'

type UserDevice = {
  id: number
  deviceId: number
  type: string
  userId: string
  deviceName: string
}

type TelemetryPayload = {
  timestamp: string
  device_id: string
  status: string
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
}

export const useDeviceTelemetry = (userDevices: UserDevice[]) => {
  const [telemetry, setTelemetry] = useState<Record<string, TelemetryPayload>>(
    {}
  )

  const clientRef = useRef<MqttClient | null>(null)

  useEffect(() => {
    if (!userDevices || userDevices.length === 0) return

    // Create connection once
    if (!clientRef.current) {
      clientRef.current = mqtt.connect(
        process.env.NEXT_PUBLIC_MQTT_BROKER_URL as string,
        {
          reconnectPeriod: 3000,
        }
      )
    }

    const client = clientRef.current

    client.on('connect', () => {
      console.log('MQTT Connected')
      userDevices.forEach((device) => {
        const topic = `devices/${device.deviceId}/telemetry`
        client.subscribe(topic, (err) => {
          if (err) {
            console.error('Subscription error:', err)
          }
        })
      })
    })

    client.on('message', (topic, message) => {
      try {
        const parsed: TelemetryPayload = JSON.parse(message.toString())
        // Update only that specific device
        setTelemetry((prev) => ({
          ...prev,
          [parsed.device_id]: parsed,
        }))
      } catch (error) {
        console.error('Invalid telemetry message', error)
      }
    })

    return () => {
      if (client) {
        userDevices.forEach((device) => {
          const topic = `devices/${device.deviceId}/telemetry`
          client.unsubscribe(topic)
        })
      }
    }
  }, [userDevices])

  return telemetry
}
