'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Camera, Upload, X } from 'lucide-react'
import type { Issue, IssueImage, IssueTimelineEntry } from '@/types/api'

interface StartWorkDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (note?: string) => void
  isLoading?: boolean
  issueTitle?: string
}

export function StartWorkDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
  issueTitle
}: StartWorkDialogProps) {
  const [note, setNote] = useState('')

  const handleConfirm = () => {
    onConfirm(note || undefined)
    setNote('')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Working on Issue</DialogTitle>
          <DialogDescription>
            {issueTitle && <span className="block font-medium text-foreground mt-2">{issueTitle}</span>}
            You are about to start working on this issue. Add any notes if needed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="start-note">Work Notes (Optional)</Label>
            <Textarea
              id="start-note"
              placeholder="E.g., Equipment being used, expected completion time..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Starting...' : 'Start Work'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ResolveIssueDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (photos: File[], note?: string, materials?: Array<{ material: string; quantity: number }>) => void
  isLoading?: boolean
  issueTitle?: string
}

const PRESET_MATERIALS = [
  "Bags of Concrete (50kg)",
  "LED Bulbs (30W)",
  "LED Bulbs (50W)",
  "Streetlight Fixture",
  "PVC Pipe (3-inch, 10ft)",
  "PVC Pipe (4-inch, 10ft)",
  "Manhole Cover (Standard)",
  "Asphalt Mix (50kg bags)",
  "Road Paint (Yellow, 5L)",
  "Road Paint (White, 5L)",
  "Gravel (cubic feet)",
  "Other (Specify)"
]

export function ResolveIssueDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
  issueTitle
}: ResolveIssueDialogProps) {
  const [note, setNote] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  // Material Tracker state
  const [materials, setMaterials] = useState<Array<{ material: string; quantity: number }>>([])
  const [selectedPreset, setSelectedPreset] = useState(PRESET_MATERIALS[0])
  const [customMaterial, setCustomMaterial] = useState('')
  const [materialQty, setMaterialQty] = useState('1')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Filter to only images
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert('Please select only image files')
      return
    }

    // Add to existing photos
    const newPhotos = [...photos, ...imageFiles]
    setPhotos(newPhotos)

    // Create previews
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file))
    setPreviews([...previews, ...newPreviews])
  }

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]) // Clean up
    setPhotos(photos.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const addMaterial = () => {
    const name = selectedPreset === 'Other (Specify)' ? customMaterial.trim() : selectedPreset
    if (!name) {
      alert('Please select or specify a material name')
      return
    }
    const qty = parseInt(materialQty, 10)
    if (isNaN(qty) || qty <= 0) {
      alert('Quantity must be greater than 0')
      return
    }

    // If material already exists, merge the quantities
    const existingIdx = materials.findIndex(m => m.material.toLowerCase() === name.toLowerCase())
    if (existingIdx !== -1) {
      const updated = [...materials]
      updated[existingIdx].quantity += qty
      setMaterials(updated)
    } else {
      setMaterials([...materials, { material: name, quantity: qty }])
    }

    setCustomMaterial('')
    setMaterialQty('1')
  }

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index))
  }

  const handleConfirm = () => {
    if (photos.length === 0) {
      alert('At least one after photo is required to resolve the issue')
      return
    }
    onConfirm(photos, note || undefined, materials.length > 0 ? materials : undefined)
    // Reset state
    setNote('')
    setPhotos([])
    previews.forEach(url => URL.revokeObjectURL(url))
    setPreviews([])
    setMaterials([])
  }

  const handleClose = () => {
    // Clean up object URLs
    previews.forEach(url => URL.revokeObjectURL(url))
    setNote('')
    setPhotos([])
    setPreviews([])
    setMaterials([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resolve Issue - Upload Proof & Material Tracking</DialogTitle>
          <DialogDescription>
            {issueTitle && <span className="block font-medium text-foreground mt-2">{issueTitle}</span>}
            Upload photos showing the completed work and select any materials consumed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Photo Upload Area */}
          <div className="space-y-2">
            <Label>After Photos * (Required)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
                disabled={isLoading}
              />
              <Label 
                htmlFor="photo-upload" 
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="flex gap-2 items-center justify-center">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Click to upload photos or drag and drop
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG up to 10MB each
                </span>
              </Label>
            </div>
          </div>

          {/* Photo Previews */}
          {previews.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Photos ({photos.length})</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-32 rounded-lg border overflow-hidden">
                      <Image
                        src={preview}
                        alt={`After photo ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {(photos[index].size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials Consumed (Inventory Tracking) */}
          <div className="border border-amber-200/60 rounded-xl p-4 bg-amber-50/15 space-y-4">
            <Label className="font-semibold text-amber-950 block">Resource & Material Tracking</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1">
                <span className="text-xs text-amber-800">Select Material</span>
                <select 
                  value={selectedPreset} 
                  onChange={e => setSelectedPreset(e.target.value)}
                  className="w-full bg-white border border-amber-200 rounded-lg p-2 text-sm"
                  disabled={isLoading}
                >
                  {PRESET_MATERIALS.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {selectedPreset === 'Other (Specify)' && (
                <div className="flex-1 space-y-1">
                  <span className="text-xs text-amber-800">Specify Custom Name</span>
                  <Input 
                    placeholder="e.g. Copper Wire (meters)"
                    value={customMaterial}
                    onChange={e => setCustomMaterial(e.target.value)}
                    className="bg-white border-amber-200"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="w-24 space-y-1">
                <span className="text-xs text-amber-800">Qty</span>
                <Input 
                  type="number"
                  min="1"
                  value={materialQty}
                  onChange={e => setMaterialQty(e.target.value)}
                  className="bg-white border-amber-200"
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="button" 
                onClick={addMaterial} 
                className="sm:self-end bg-indigo-50/20 text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
                disabled={isLoading}
              >
                Add
              </Button>
            </div>

            {/* Added materials list */}
            {materials.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-amber-200/50">
                <span className="text-xs font-semibold text-amber-900 block">Consumed items for this task:</span>
                <div className="flex flex-wrap gap-2">
                  {materials.map((item, idx) => (
                    <Badge key={idx} className="bg-indigo-500/20 text-indigo-600 border border-indigo-200 px-3 py-1 flex items-center gap-1.5 text-xs font-medium">
                      {item.material} x {item.quantity}
                      <button 
                        type="button" 
                        onClick={() => removeMaterial(idx)} 
                        className="text-indigo-600 hover:text-red-600 ml-1 font-bold"
                        disabled={isLoading}
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resolution Notes */}
          <div className="space-y-2">
            <Label htmlFor="resolve-note">Resolution Notes (Optional)</Label>
            <Textarea
              id="resolve-note"
              placeholder="Describe the work completed, materials used, etc..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || photos.length === 0}
          >
            {isLoading ? 'Resolving...' : `Resolve Issue (${photos.length} photos)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface IssueDetailsDialogProps {
  open: boolean
  onClose: () => void
  issue: Issue | null // Full issue details
}

export function IssueDetailsDialog({
  open,
  onClose,
  issue
}: IssueDetailsDialogProps) {
  if (!issue) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{issue.title}</DialogTitle>
          <DialogDescription>
            Report ID: {issue.id.slice(0, 8)} • Created: {new Date(issue.createdAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <div className="font-medium mt-1">{issue.status}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <div className="font-medium mt-1">{issue.priority}</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs text-muted-foreground">Description</Label>
            <p className="mt-1 text-sm">{issue.description || 'No description provided'}</p>
          </div>

          {/* Location */}
          {issue.location && (
            <div>
              <Label className="text-xs text-muted-foreground">Location</Label>
              <p className="mt-1 text-sm">
                {issue.location.address || `${issue.location.latitude}, ${issue.location.longitude}`}
                {issue.location.ward && ` • Ward: ${issue.location.ward}`}
                {issue.location.zone && ` • Zone: ${issue.location.zone}`}
              </p>
            </div>
          )}

          {/* Category & Department */}
          <div className="grid grid-cols-2 gap-4">
            {issue.category && (
              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <div className="mt-1 text-sm">{issue.category}</div>
              </div>
            )}
            {issue.department && (
              <div>
                <Label className="text-xs text-muted-foreground">Department</Label>
                <div className="mt-1 text-sm">{issue.department.name}</div>
              </div>
            )}
          </div>

          {/* Before Photos */}
          {issue.images && issue.images.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Photos ({issue.images.length})</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {issue.images.map((img: IssueImage, idx: number) => (
                  <div key={idx} className="relative w-full h-32 rounded border overflow-hidden">
                    <Image
                      src={img.url}
                      alt={img.caption || `Issue photo ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="33vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {issue.timeline && issue.timeline.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Timeline</Label>
              <div className="mt-2 space-y-2">
                {issue.timeline.map((entry: IssueTimelineEntry, idx: number) => (
                  <div key={idx} className="text-sm border-l-2 pl-3 py-1">
                    <div className="font-medium">{entry.action}</div>
                    {entry.description && <div className="text-muted-foreground">{entry.description}</div>}
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                      {entry.performedBy && ` • ${entry.performedBy.name}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
