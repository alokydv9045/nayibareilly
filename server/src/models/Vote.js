import mongoose from 'mongoose'

const voteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true, index: true },
}, { timestamps: true })

voteSchema.index({ user: 1, issue: 1 }, { unique: true })

export default mongoose.model('Vote', voteSchema)
