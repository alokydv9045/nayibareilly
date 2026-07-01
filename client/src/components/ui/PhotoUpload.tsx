"use client"

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Camera, 
  X, 
  GripVertical, 
  AlertCircle, 
  CheckCircle
} from 'lucide-react';
import NextImage from 'next/image'
import { cn } from '@/lib/utils/helpers';
import { useTranslation, Language } from '@/lib/utils/translations';

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
  uploadProgress?: number;
  error?: string;
  compressed?: boolean;
}

interface PhotoUploadProps {
  value: PhotoFile[];
  onChange: (photos: PhotoFile[]) => void;
  language: Language;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  minPhotos?: number;
  maxPhotos?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  enableCompression?: boolean;
  compressQuality?: number;
}

// Image compression utility
const compressImage = (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 1920px width)
      const maxWidth = 1920;
      const maxHeight = 1920;
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export default function PhotoUpload({
  value = [],
  onChange,
  language,
  className,
  disabled = false,
  required = false,
  minPhotos = 2,
  maxPhotos = 3,
  maxFileSize = 10, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'],
  enableCompression = true,
  compressQuality = 0.8,
}: PhotoUploadProps) {
  const t = useTranslation(language);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const isValid = useMemo(() => {
    return value.length >= minPhotos && value.length <= maxPhotos;
  }, [value.length, minPhotos, maxPhotos]);

  const remainingSlots = maxPhotos - value.length;

  const createPhotoFile = useCallback(async (file: File): Promise<PhotoFile> => {
    const id = Math.random().toString(36).substr(2, 9);
    const preview = URL.createObjectURL(file);
    
    let processedFile = file;
    let compressed = false;
    
    // Compress if enabled and file is large
    if (enableCompression && file.size > 1024 * 1024) { // > 1MB
      try {
        processedFile = await compressImage(file, compressQuality);
        compressed = true;
      } catch (err) {
        console.error('Image compression failed:', err);
      }
    }
    
    return {
      id,
      file: processedFile,
      preview,
      compressed,
    };
  }, [enableCompression, compressQuality]);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return t.errors.photoInvalidType;
    }
    
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return t.errors.photoTooLarge;
    }
    
    return null;
  }, [acceptedTypes, maxFileSize, t.errors.photoInvalidType, t.errors.photoTooLarge]);

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (disabled) return;
    
    setError(null);
    setIsUploading(true);
    
    const selectedFiles = Array.from(files);
    
    // Check if adding these files would exceed max limit
    if (value.length + selectedFiles.length > maxPhotos) {
      setError(t.errors.photosTooMany);
      setIsUploading(false);
      return;
    }
    
    try {
      const newPhotos: PhotoFile[] = [];
      
      for (const file of selectedFiles) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }
        
        const photoFile = await createPhotoFile(file);
        newPhotos.push(photoFile);
      }
      
      if (newPhotos.length > 0) {
        onChange([...value, ...newPhotos]);
      }
    } catch (err) {
      console.error('File processing error:', err);
      setError('Failed to process files');
    } finally {
      setIsUploading(false);
    }
  }, [disabled, value, maxPhotos, validateFile, createPhotoFile, onChange, t.errors.photosTooMany]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [disabled, handleFileSelect]);

  const removePhoto = useCallback((id: string) => {
    const photoToRemove = value.find(p => p.id === id);
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
    onChange(value.filter(p => p.id !== id));
  }, [value, onChange]);

  // Note: reordering UI not implemented yet; helper removed to avoid dead code warning

  const openFileDialog = useCallback(() => {
    if (!disabled && remainingSlots > 0) {
      fileInputRef.current?.click();
    }
  }, [disabled, remainingSlots]);

  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      value.forEach(photo => {
        URL.revokeObjectURL(photo.preview);
      });
    };
  }, [value]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card 
        className={cn(
          'relative transition-colors cursor-pointer',
          isDragOver && 'border-emerald-500 bg-emerald-50',
          disabled && 'opacity-50 cursor-not-allowed',
          remainingSlots === 0 && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex justify-center">
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-emerald-600" />
              ) : (
                <Upload className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-slate-400" />
              )}
            </div>
            
            <div>
              <p className="text-base sm:text-lg font-medium text-slate-900 mb-1">
                {t.addPhotos}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mb-2">
                {t.photosHelper}
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 text-xs text-slate-400">
                <span>JPG, PNG, HEIC up to {maxFileSize}MB each</span>
                {enableCompression && (
                  <Badge variant="outline" className="text-xs mt-1 sm:mt-0">
                    Auto-compress
                  </Badge>
                )}
              </div>
            </div>
            
            {!isUploading && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || remainingSlots === 0}
                className="w-full sm:w-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog();
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Choose Files</span>
                <span className="sm:hidden">Add Photos</span>
                <span className="ml-1">({remainingSlots} remaining)</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* Photo Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {value.map((photo, index) => (
            <Card key={photo.id} className="relative group">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <NextImage
                    src={photo.preview}
                    alt={`Upload ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover rounded-lg"
                    unoptimized
                  />
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-start justify-between p-1 sm:p-2">
                    {/* Remove Button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 sm:h-8 sm:w-8 p-0"
                      onClick={() => removePhoto(photo.id)}
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    
                    {/* Drag Handle */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                      <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                  
                  {/* Photo Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 sm:p-3 rounded-b-lg">
                    <div className="flex items-center justify-between text-white text-xs">
                      <span className="truncate flex-1 text-xs sm:text-sm">
                        {photo.file?.name || `Photo ${index + 1}`}
                      </span>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 ml-2">
                        {photo.compressed && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            Compressed
                          </Badge>
                        )}
                        <span className="text-xs">{photo.file ? (photo.file.size / (1024 * 1024)).toFixed(1) : '0'}MB</span>
                      </div>
                    </div>
                    
                    {photo.uploadProgress !== undefined && (
                      <Progress value={photo.uploadProgress} className="mt-1 h-1" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Status Messages */}
      <div className="space-y-2">
        {/* Requirements Check */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Photos: {value.length} of {minPhotos}-{maxPhotos} required
          </span>
          <div className="flex items-center gap-1">
            {isValid ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
            <span className={cn(
              'text-xs',
              isValid ? 'text-green-600' : 'text-yellow-600'
            )}>
              {isValid ? 'Requirements met' : 'Upload more photos'}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Required Field Indicator */}
        {required && !isValid && (
          <div className="text-xs text-red-600">
            {t.errors.photosRequired}
          </div>
        )}
      </div>
    </div>
  );
}