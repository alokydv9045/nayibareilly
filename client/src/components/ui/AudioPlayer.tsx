"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { Language } from '@/lib/utils/translations';

interface AudioPlayerProps {
  audioBlob: Blob;
  transcript?: string;
  language: Language;
  className?: string;
  onDelete?: () => void;
  showTranscript?: boolean;
  showControls?: boolean;
}

export default function AudioPlayer({
  audioBlob,
  transcript,
  language: _language,
  className,
  onDelete,
  showTranscript = true,
  showControls = true,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Create audio URL from blob
  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = (clickX / rect.width) * duration;
    
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  }, [duration]);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadAudio = useCallback(() => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `voice-note-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [audioUrl]);

  const restartAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    if (isPlaying) {
      audio.play();
    }
  }, [isPlaying]);

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4 space-y-3">
        {/* Hidden Audio Element */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        {/* Header with File Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              🎵 Voice Note
            </Badge>
            <span className="text-sm text-muted-foreground">
              {(audioBlob.size / 1024).toFixed(1)} KB
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatTime(duration)}
          </div>
        </div>

        {/* Audio Controls */}
        {showControls && (
          <div className="space-y-3">
            {/* Play Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayPause}
                className="w-10 h-10 p-0"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={restartAudio}
                className="w-8 h-8 p-0"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="w-8 h-8 p-0"
              >
                {isMuted ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </Button>
              
              <div className="flex-1 mx-2">
                <div className="text-xs text-muted-foreground mb-1">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div 
              className="w-full h-2 bg-slate-200 rounded-full cursor-pointer overflow-hidden"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-emerald-500 transition-all duration-100"
                style={{ 
                  width: duration ? `${(currentTime / duration) * 100}%` : '0%' 
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAudio}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
              
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  className="text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Transcript */}
        {showTranscript && transcript && (
          <div className="border-t pt-3">
            <div className="text-xs text-muted-foreground mb-2">
              Transcript:
            </div>
            <div className="text-sm leading-relaxed p-3 bg-slate-50 rounded-lg">
              {transcript}
            </div>
          </div>
        )}

        {/* Waveform Placeholder */}
        <div className="h-16 bg-slate-100 rounded-lg flex items-center justify-center">
          <div className="flex items-end gap-1 h-8">
            {Array.from({ length: 32 }, (_, i) => (
              <div
                key={i}
                className="bg-blue-400 rounded-full transition-all duration-150"
                style={{
                  width: '2px',
                  height: `${Math.random() * 100}%`,
                  minHeight: '4px',
                  opacity: currentTime && duration 
                    ? (i / 32) < (currentTime / duration) ? 1 : 0.3 
                    : 0.3,
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}