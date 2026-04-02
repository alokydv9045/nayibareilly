// Storage service with pluggable backends (Cloudinary by default, S3 optional)

import { v2 as cloudinary } from 'cloudinary'
import { S3Client, PutObjectCommand, DeleteObjectsCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Readable } from 'stream'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROVIDERS = {
  CLOUDINARY: 'cloudinary',
  S3: 's3'
}

const sanitizeFolder = (folder = '') => folder.replace(/\\/g, '/').replace(/^\/+|\/+$|\/+/g, '/').replace(/^\//, '').replace(/\/$/, '')

class StorageService {
  constructor() {
    this.provider = (process.env.STORAGE_PROVIDER || PROVIDERS.CLOUDINARY).toLowerCase()
    this.bucketName = null
    this.cdnBase = null
    this.ready = false
    this.region = null
    this.bucket = null
    this.s3 = null
    this.cloudinaryFolder = process.env.CLOUDINARY_FOLDER || 'nayibareilly'

    if (this.provider === PROVIDERS.S3) {
      this.initializeS3()
    } else {
      this.provider = PROVIDERS.CLOUDINARY
      this.initializeCloudinary()
    }
  }

  initializeCloudinary() {
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME
      const apiKey = process.env.CLOUDINARY_API_KEY
      const apiSecret = process.env.CLOUDINARY_API_SECRET

      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set in .env file. Get credentials from https://cloudinary.com/console')
      }

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
      })

      this.bucketName = cloudName
      this.cdnBase = process.env.STORAGE_CDN_BASE_URL || `https://res.cloudinary.com/${cloudName}`
      this.ready = true
      console.log(`☁️  Cloudinary storage ready (cloud: ${cloudName})`)
    } catch (error) {
      console.error('❌ Cloudinary initialization error:', error.message)
      console.error('   💡 Tip: Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to server/.env')
      this.ready = false
    }
  }

  initializeS3() {
    try {
      this.bucketName = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET
      this.region = process.env.S3_REGION || process.env.AWS_REGION

      if (!this.bucketName || !this.region) {
        throw new Error('S3_BUCKET (or AWS_S3_BUCKET) and AWS_REGION (or S3_REGION) must be set')
      }

      this.s3 = new S3Client({ region: this.region })
      this.cdnBase = (process.env.STORAGE_CDN_BASE_URL || process.env.S3_CDN_BASE_URL || `https://${this.bucketName}.s3.${this.region}.amazonaws.com`).replace(/\/$/, '')
      this.ready = true
      console.log('☁️ S3 storage ready')
    } catch (error) {
      console.error('❌ S3 initialization error:', error.message)
      this.ready = false
    }
  }

  ensureReady() {
    if (!this.ready) {
      throw new Error('Cloud storage is not configured. Please check environment variables.')
    }
  }

  buildKey(folder, originalName) {
    const ext = path.extname(originalName || '').toLowerCase()
    const safeExt = ext || ''
    const base = crypto.randomUUID()
    const timestamp = Date.now()
    const normalizedFolder = sanitizeFolder(folder)
    return `${normalizedFolder ? `${normalizedFolder}/` : ''}${timestamp}-${base}${safeExt}`
  }

  buildPublicUrl(key) {
    const encoded = key.split('/').map(segment => encodeURIComponent(segment)).join('/')
    return `${this.cdnBase}/${encoded}`
  }

  getContentType(fileName, fallback = 'application/octet-stream') {
    const ext = path.extname(fileName || '').toLowerCase()
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg'
      case '.png':
        return 'image/png'
      case '.gif':
        return 'image/gif'
      case '.webp':
        return 'image/webp'
      case '.pdf':
        return 'application/pdf'
      case '.doc':
        return 'application/msword'
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      default:
        return fallback
    }
  }

  extractBuffer(file) {
    if (file?.buffer) return file.buffer
    if (file?.path && fs.existsSync(file.path)) {
      return fs.readFileSync(file.path)
    }
    throw new Error('Uploaded file is missing buffer data')
  }

  async uploadBuffer(buffer, originalName, { folder = 'issues', contentType, metadata } = {}) {
    this.ensureReady()

    const key = this.buildKey(folder, originalName)
    const mimeType = contentType || this.getContentType(originalName)
    const size = buffer.length

    if (this.provider === PROVIDERS.CLOUDINARY) {
      // Upload to Cloudinary
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `${this.cloudinaryFolder}/${folder}`,
            public_id: path.parse(key).name, // Use the generated key as public_id
            resource_type: 'auto', // Automatically detect resource type
            context: {
              original_name: originalName || 'file',
              uploaded_at: new Date().toISOString(),
              ...metadata
            }
          },
          (error, result) => {
            if (error) {
              reject(error)
            } else {
              const url = result.secure_url
              resolve({
                key: result.public_id,
                url,
                mimeType: result.format ? `image/${result.format}` : mimeType,
                size: result.bytes || size,
                originalName: originalName || 'file',
                cloudinaryData: {
                  asset_id: result.asset_id,
                  version: result.version,
                  format: result.format
                }
              })
            }
          }
        )

        // Convert buffer to stream and pipe to Cloudinary
        const readableStream = Readable.from(buffer)
        readableStream.pipe(uploadStream)
      })
    } else if (this.provider === PROVIDERS.S3) {
      const putParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        Metadata: {
          originalname: originalName || 'file'
        }
      }

      const acl = process.env.S3_PUT_OBJECT_ACL
      if (acl) {
        putParams.ACL = acl
      }

      if (process.env.S3_CACHE_CONTROL) {
        putParams.CacheControl = process.env.S3_CACHE_CONTROL
      }

      await this.s3.send(new PutObjectCommand(putParams))

      const url = this.buildPublicUrl(key)
      return { key, url, mimeType, size, originalName: originalName || 'file' }
    }
  }

  async uploadIssueMedia(files = [], { folder = 'issues' } = {}) {
    if (!Array.isArray(files) || files.length === 0) return []

    const uploads = []
    for (const file of files) {
      const buffer = this.extractBuffer(file)
      const result = await this.uploadBuffer(buffer, file.originalname || file.name || 'file', {
        folder,
        contentType: file.mimetype,
        metadata: { fieldname: file.fieldname || 'image' }
      })

      uploads.push({
        ...result,
        mimeType: file.mimetype || result.mimeType,
        size: typeof file.size === 'number' ? file.size : result.size
      })
    }

    return uploads
  }

  // Audio file upload specifically for voice notes
  async uploadAudioFile(audioBuffer, issueId, { originalName = 'voice-note.webm', metadata = {} } = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `${issueId}-voice-${timestamp}.webm`
    
    const result = await this.uploadBuffer(audioBuffer, fileName, {
      folder: `issues/${issueId}/audio`,
      contentType: 'audio/webm',
      metadata: {
        type: 'voice_note',
        originalName,
        issueId,
        ...metadata
      }
    })

    return {
      ...result,
      mimeType: 'audio/webm',
      type: 'voice_note'
    }
  }

  async deleteKeys(keys = []) {
    if (!Array.isArray(keys) || !keys.length) return
    this.ensureReady()

    if (this.provider === PROVIDERS.CLOUDINARY) {
      await Promise.all(keys.map(async (key) => {
        try {
          // Extract public_id from key (remove folder prefix if exists)
          const publicId = key.includes('/') ? key : key
          await cloudinary.uploader.destroy(publicId, { invalidate: true })
        } catch (error) {
          console.warn('Failed to delete Cloudinary asset:', key, error.message)
        }
      }))
    } else if (this.provider === PROVIDERS.S3) {
      const objects = keys.map((key) => ({ Key: key }))
      await this.s3.send(new DeleteObjectsCommand({ Bucket: this.bucketName, Delete: { Objects: objects, Quiet: true } }))
    }
  }

  keyFromUrl(url) {
    if (!url) return null

    // Cloudinary URL pattern: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    if (this.provider === PROVIDERS.CLOUDINARY) {
      const cloudinaryPattern = /https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/
      const match = url.match(cloudinaryPattern)
      if (match?.[2]) {
        // Return the public_id
        return match[2]
      }
    }

    // S3 or CDN URL pattern
    if (this.cdnBase) {
      const normalizedBase = this.cdnBase.endsWith('/') ? this.cdnBase : `${this.cdnBase}/`
      if (url.startsWith(normalizedBase)) {
        return decodeURIComponent(url.slice(normalizedBase.length))
      }
    }

    return null
  }

  async deleteByUrl(urls = []) {
    const keys = urls
      .map((url) => this.keyFromUrl(url))
      .filter(Boolean)
    if (keys.length) {
      await this.deleteKeys(keys)
    }
  }

  async fileExists(urlOrKey) {
    this.ensureReady()
    const key = urlOrKey.includes('://') ? this.keyFromUrl(urlOrKey) : urlOrKey
    if (!key) return false

    try {
      if (this.provider === PROVIDERS.CLOUDINARY) {
        const result = await cloudinary.api.resource(key, { resource_type: 'image' }).catch(() => null)
        return !!result
      } else if (this.provider === PROVIDERS.S3) {
        await this.s3.send(new HeadObjectCommand({ Bucket: this.bucketName, Key: key }))
        return true
      }
    } catch {
      return false
    }
  }

  async testConnection() {
    try {
      this.ensureReady()
      if (this.provider === PROVIDERS.CLOUDINARY) {
        // Ping Cloudinary API
        await cloudinary.api.ping()
      } else if (this.provider === PROVIDERS.S3) {
        await this.s3.send(new ListObjectsV2Command({ Bucket: this.bucketName, MaxKeys: 1 }))
      }
      return true
    } catch (error) {
      console.error('Storage connectivity check failed:', error.message)
      return false
    }
  }

  // Backwards-compatible helpers
  async uploadPhoto(buffer, fileName, folder = 'issues') {
    const result = await this.uploadBuffer(buffer, fileName, { folder })
    return result.url
  }

  async uploadMultiplePhotos(files, folder = 'issues') {
    const uploads = await this.uploadIssueMedia(files, { folder })
    return uploads.map((item) => item.url)
  }

  async deletePhoto(url) {
    await this.deleteByUrl([url])
    return true
  }

  async deleteMultiplePhotos(urls) {
    await this.deleteByUrl(urls)
    return true
  }
}

const storageService = new StorageService()

export default storageService
