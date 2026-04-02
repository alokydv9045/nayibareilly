import 'server-only'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface UploadResult {
  url: string
  path: string
  publicUrl: string
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: string,
  folder: string
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      url: publicData.publicUrl,
      path: filePath,
      publicUrl: publicData.publicUrl,
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket: string,
  folder: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) => uploadFile(file, bucket, folder))
  return Promise.all(uploadPromises)
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

/**
 * Delete multiple files
 */
export async function deleteMultipleFiles(
  bucket: string,
  paths: string[]
): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove(paths)

    if (error) {
      throw new Error(`Batch delete failed: ${error.message}`)
    }
  } catch (error) {
    console.error('Error deleting files:', error)
    throw error
  }
}

/**
 * Generate signed URL with expiration
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600 // 1 hour by default
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`)
    }

    return data.signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw error
  }
}

/**
 * Storage buckets configuration
 */
export const StorageBuckets = {
  ISSUE_PHOTOS: 'issue-photos',
  PROFILE_PICTURES: 'profile-pictures',
  DOCUMENTS: 'documents',
} as const

/**
 * Storage folders configuration
 */
export const StorageFolders = {
  BEFORE_PHOTOS: 'before',
  AFTER_PHOTOS: 'after',
  ISSUE_PHOTOS: 'issues',
  AVATARS: 'avatars',
  REPORTS: 'reports',
} as const

/**
 * Helper function to upload issue photos
 */
export async function uploadIssuePhotos(
  beforePhotos: File[],
  afterPhotos: File[],
  issueId: string
): Promise<{ beforeUrls: string[]; afterUrls: string[] }> {
  const beforeFolder = `${StorageFolders.ISSUE_PHOTOS}/${issueId}/${StorageFolders.BEFORE_PHOTOS}`
  const afterFolder = `${StorageFolders.ISSUE_PHOTOS}/${issueId}/${StorageFolders.AFTER_PHOTOS}`

  const [beforeResults, afterResults] = await Promise.all([
    beforePhotos.length > 0
      ? uploadMultipleFiles(beforePhotos, StorageBuckets.ISSUE_PHOTOS, beforeFolder)
      : Promise.resolve([]),
    afterPhotos.length > 0
      ? uploadMultipleFiles(afterPhotos, StorageBuckets.ISSUE_PHOTOS, afterFolder)
      : Promise.resolve([]),
  ])

  return {
    beforeUrls: beforeResults.map((r) => r.publicUrl),
    afterUrls: afterResults.map((r) => r.publicUrl),
  }
}

/**
 * Helper function to upload profile picture
 */
export async function uploadProfilePicture(
  file: File,
  userId: string
): Promise<string> {
  const result = await uploadFile(
    file,
    StorageBuckets.PROFILE_PICTURES,
    `${StorageFolders.AVATARS}/${userId}`
  )
  return result.publicUrl
}

export default supabase
