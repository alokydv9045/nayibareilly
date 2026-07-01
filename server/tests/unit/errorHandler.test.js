import { errorHandler, AppError, ErrorTypes } from '../../src/utils/errorHandler.js'
import { jest } from '@jest/globals'

describe('Global Error Handler', () => {
  let mockReq, mockRes, mockNext

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      url: '/api/test',
      body: {},
      query: {},
      params: {},
      headers: {},
      get: jest.fn()
    }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      headersSent: false
    }
    mockNext = jest.fn()
  })

  it('should format AppError correctly', async () => {
    const error = new AppError('Custom error', 400, ErrorTypes.VALIDATION)
    
    await errorHandler(error, mockReq, mockRes, mockNext)
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          type: 'VALIDATION_ERROR',
          message: 'Custom error',
          statusCode: 400
        })
      })
    )
  })

  it('should catch validation errors from express-validator', async () => {
    const error = new Error('Invalid input')
    error.name = 'ValidationError'
    
    await errorHandler(error, mockReq, mockRes, mockNext)
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          type: 'VALIDATION_ERROR',
          statusCode: 400
        })
      })
    )
  })

  it('should format http-errors correctly (404)', async () => {
    const error = new Error('Not found')
    error.status = 404
    error.statusCode = 404
    
    await errorHandler(error, mockReq, mockRes, mockNext)
    
    expect(mockRes.status).toHaveBeenCalledWith(404)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          type: 'NOT_FOUND_ERROR',
          statusCode: 404
        })
      })
    )
  })

  it('should default to 500 for unknown errors', async () => {
    const error = new Error('Unknown crash')
    
    await errorHandler(error, mockReq, mockRes, mockNext)
    
    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          type: 'INTERNAL_SERVER_ERROR',
          statusCode: 500
        })
      })
    )
  })
})
