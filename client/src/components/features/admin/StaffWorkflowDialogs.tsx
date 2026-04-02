'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
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
  onConfirm: (photos: File[], note?: string) => void
  isLoading?: boolean
  issueTitle?: string
}

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

  const handleConfirm = () => {
    if (photos.length === 0) {
      alert('At least one after photo is required to resolve the issue')
      return
    }
    onConfirm(photos, note || undefined)
    // Reset state
    setNote('')
    setPhotos([])
    previews.forEach(url => URL.revokeObjectURL(url))
    setPreviews([])
  }

  const handleClose = () => {
    // Clean up object URLs
    previews.forEach(url => URL.revokeObjectURL(url))
    setNote('')
    setPhotos([])
    setPreviews([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resolve Issue - Upload After Photos</DialogTitle>
          <DialogDescription>
            {issueTitle && <span className="block font-medium text-foreground mt-2">{issueTitle}</span>}
            Upload photos showing the completed work. At least one photo is required.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
