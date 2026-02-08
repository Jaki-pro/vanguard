import { InfluxDB } from '@influxdata/influxdb-client'
import type { Context } from 'hono'

const INFLUX_URL = process.env.INFLUX_URL!
const INFLUX_BUCKET = process.env.INFLUX_BUCKET!
const INFLUX_ORG = process.env.INFLUX_ORG!
const INFLUX_TOKEN = process.env.INFLUX_TOKEN!

const influx = new InfluxDB({
  url: INFLUX_URL,
  token: INFLUX_TOKEN,
})

export const getTelemetryByDeviceId = async (c: Context) => {
  const { device_id } = c.req.valid('param') as any

  try {
    const queryApi = influx.getQueryApi(INFLUX_ORG)

    const query = `
      from(bucket: "${INFLUX_BUCKET}")
        |> range(start: 2026-02-07T00:00:00Z)
        |> filter(fn: (r) => r._measurement == "device_telemetry")
        |> filter(fn: (r) => r.device_id == "${device_id}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"], desc: true)
        |> limit(n: 100)
    `

    const results: any[] = []

    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const record = tableMeta.toObject(row)
          results.push({
            timestamp: record._time,
            device_id: record.device_id,
            status: record.status,
            latitude: record.latitude,
            longitude: record.longitude,
            altitude: record.altitude,
            speed: record.speed,
            heading: record.heading,
            accuracy: record.accuracy,
            satellites: record.satellites,
            battery_level: record.battery_level,
            charging: record.charging,
            signal_strength: record.signal_strength,
            temperature: record.temperature,
          })
        },
        error(error) {
          console.error('Query error:', error)
          reject(error)
        },
        complete() {
          resolve()
        },
      })
    })

    return c.json({
      success: true,
      device_id,
      count: results.length,
      data: results,
    }, 200)
  } catch (error) {
    console.error('Error fetching telemetry:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to fetch telemetry data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}