import { Router } from 'express'
import multer from 'multer'
import { uploadVoiceNote, getVoiceNotes, deleteVoiceNote } from '../../controllers/v1/voiceNotes.controller.js'
import { auth } from '../../middlewares/auth.js'

const router = Router()

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedAudioTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']
    if (allowedAudioTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid audio format'), false)
    }
  }
})

// Routes
router.post('/:issueId/voice-notes', auth, upload.single('audio'), uploadVoiceNote)
router.get('/:issueId/voice-notes', getVoiceNotes) // Public - can view voice notes
router.delete('/:issueId/voice-notes/:voiceNoteId', auth, deleteVoiceNote)

export default router