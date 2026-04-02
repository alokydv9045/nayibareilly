import mongoose from 'mongoose'

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'in_progress', 'resolved'], default: 'pending', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
  images: [{ type: String }],
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  votes: { type: Number, default: 0 },
  reportId: { type: String, unique: true, index: true },
  timeline: [{
    status: String,
    note: String,
    at: { type: Date, default: Date.now }
  }]
}, { timestamps: true })

issueSchema.index({ title: 'text', description: 'text' })
// Hot-path indexes for listing and sorting
issueSchema.index({ createdAt: -1 })
issueSchema.index({ votes: -1, createdAt: -1 })
issueSchema.index({ status: 1, category: 1, createdAt: -1 })

export default mongoose.model('Issue', issueSchema)
