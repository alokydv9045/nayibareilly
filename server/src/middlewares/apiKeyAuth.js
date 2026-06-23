import prisma from '../config/prisma.js'

export const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query?.apiKey

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: {
        type: 'AUTHENTICATION_ERROR',
        message: 'API key is required in x-api-key header or apiKey query parameter',
        statusCode: 401
      }
    })
  }

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey }
    })

    if (!keyRecord || !keyRecord.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Invalid or deactivated API key',
          statusCode: 401
        }
      })
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message: 'Expired API key',
          statusCode: 401
        }
      })
    }

    // Update lastUsedAt asynchronously
    prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() }
    }).catch(err => console.warn('Failed to update API key lastUsedAt:', err.message))

    req.apiKey = keyRecord
    next()
  } catch (error) {
    console.error('API key auth error:', error)
    return res.status(500).json({
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error during API key validation',
        statusCode: 500
      }
    })
  }
}
