import request from 'supertest'
import express from 'express'
import healthRoutes from '../../src/routes/v1/health/index.js'
import { errorHandler } from '../../src/utils/errorHandler.js'

describe('Health API Endpoints', () => {
  let app

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use('/api/health', healthRoutes)
    app.use(errorHandler)
  })

  it('GET /api/health should return health status', async () => {
    const res = await request(app).get('/api/health')
    
    expect([200, 503]).toContain(res.status)
    expect(res.body).toHaveProperty('status')
    expect(res.body).toHaveProperty('timestamp')
    expect(res.body).toHaveProperty('checks')
    expect(res.body.checks).toHaveProperty('database')
  })

  it('GET /api/health/ready should return readiness', async () => {
    const res = await request(app).get('/api/health/ready')
    
    expect([200, 503]).toContain(res.status)
    expect(res.body).toHaveProperty('status')
    if (res.status === 200) {
      expect(res.body.status).toBe('ready')
    } else {
      expect(res.body.status).toBe('not ready')
    }
  })
})
