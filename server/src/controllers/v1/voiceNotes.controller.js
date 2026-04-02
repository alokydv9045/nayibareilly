import storageService from '../../services/storage.service.js'
import { ok, fail } from '../../utils/apiResponse.js'
import prisma from '../../config/prisma.js'

// Upload voice note for an issue
export const uploadVoiceNote = async (req, res) => {
  try {
    const { issueId } = req.params
    const { transcript = '', duration = 0 } = req.body
    
    // Check if issue exists
    const issue = await prisma.issue.findUnique({
      where: { id: issueId }
    })
    
    if (!issue) {
      return fail(res, 404, 'Issue not found')
    }
    
    // Validate audio file
    if (!req.file) {
      return fail(res, 400, 'Audio file is required')
    }
    
    const audioFile = req.file
    const maxAudioSize = 5 * 1024 * 1024 // 5MB
    const allowedAudioTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']
    
    if (audioFile.size > maxAudioSize) {
      return fail(res, 400, 'Audio file size must be less than 5MB')
    }
    
    if (!allowedAudioTypes.includes(audioFile.mimetype)) {
      return fail(res, 400, 'Invalid audio format. Supported: WebM, MP4, MP3, WAV, OGG')
    }
    
    // Upload audio file
    const uploadResult = await storageService.uploadAudioFile(
      audioFile.buffer,
      issueId,
      {
        originalName: audioFile.originalname,
        metadata: {
          transcript,
          duration: parseInt(duration) || 0,
          uploadedBy: req.user?.id || null
        }
      }
    )
    
    // Save voice note record to database (VoiceNote model)
    const voiceNote = await prisma.voiceNote.create({
      data: {
        issueId,
        audioUrl: uploadResult.url,
        transcription: transcript,
        duration: parseInt(duration) || 0,
        fileSize: audioFile.size,
        mimeType: audioFile.mimetype,
        fileName: audioFile.originalname || uploadResult.key
      }
    })
    
    return ok(res, {
      voiceNote: {
        id: voiceNote.id,
        audioUrl: voiceNote.audioUrl,
        transcription: voiceNote.transcription,
        duration: voiceNote.duration,
        fileSize: voiceNote.fileSize,
        mimeType: voiceNote.mimeType,
        fileName: voiceNote.fileName,
        createdAt: voiceNote.createdAt
      }
    })
    
  } catch (error) {
    console.error('Voice note upload error:', error)
    return fail(res, 500, 'Failed to upload voice note')
  }
}

// Get voice notes for an issue
export const getVoiceNotes = async (req, res) => {
  try {
    const { issueId } = req.params
    
    const voiceNotes = await prisma.voiceNote.findMany({
      where: { issueId },
      orderBy: { createdAt: 'desc' }
    })

    return ok(res, { voiceNotes })
    
  } catch (error) {
    console.error('Get voice notes error:', error)
    return fail(res, 500, 'Failed to retrieve voice notes')
  }
}

// Delete voice note
export const deleteVoiceNote = async (req, res) => {
  try {
    const { issueId, voiceNoteId } = req.params
    
    // Find voice note
    const voiceNote = await prisma.voiceNote.findFirst({
      where: { id: voiceNoteId, issueId }
    })
    
    if (!voiceNote) {
      return fail(res, 404, 'Voice note not found')
    }
    
    // Delete from storage
    try {
      await storageService.deletePhoto(voiceNote.audioUrl)
    } catch (storageError) {
      console.warn('Failed to delete audio file from storage:', storageError)
    }
    
    // Delete from database
    await prisma.voiceNote.delete({ where: { id: voiceNoteId } })
    
    return ok(res, { message: 'Voice note deleted successfully' })
    
  } catch (error) {
    console.error('Delete voice note error:', error)
    return fail(res, 500, 'Failed to delete voice note')
  }
}