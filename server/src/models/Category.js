import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  color: String,
  icon: String,
}, { timestamps: true })

// Case-insensitive unique index for names
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } })

export default mongoose.model('Category', categorySchema)
