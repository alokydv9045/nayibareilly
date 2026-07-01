"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { useTranslation, Language } from '@/lib/utils/translations';
import AudioPlayer from './AudioPlayer';

interface VoiceNote {
  id: string;
  audioUrl: string;
  audioBlob?: Blob;
  transcription?: string;
  duration?: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt?: string;
}

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  onAudioRecorded?: (audioBlob: Blob, transcript: string) => void;
  onSave?: (voiceNote: VoiceNote) => void;
  issueId?: string;
  language: Language;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  maxDuration?: number; // in seconds
  enableAudioRecording?: boolean; // Enable audio file recording
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

// Extend window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

export default function VoiceInput({
  value,
  onChange,
  onAudioRecorded,
  onSave,
  issueId: _issueId,
  language,
  className,
  disabled = false,
  placeholder,
  maxDuration = 300, // 5 minutes default
  enableAudioRecording = false,
}: VoiceInputProps) {
  const t = useTranslation(language);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [voiceLang, setVoiceLang] = useState(language === 'hi' ? 'hi-IN' : 'en-IN');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [saving, setSaving] = useState(false);

  const cleanupAudioContext = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  }, []);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      cleanupAudioContext();
    };
  }, [cleanupAudioContext]);

  // Update final transcript when value changes externally
  useEffect(() => {
    if (value !== finalTranscript && !isListening) {
      setFinalTranscript(value);
    }
  }, [value, finalTranscript, isListening]);

  const setupAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Setup audio recording if enabled
      if (enableAudioRecording && stream) {
        audioChunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : 'audio/webm';
        
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          setAudioBlob(audioBlob);
          setIsRecordingAudio(false);
          
          // Call callback with audio blob and transcript
          if (onAudioRecorded && finalTranscript) {
            onAudioRecorded(audioBlob, finalTranscript);
          }
        };
        
        mediaRecorderRef.current.start(100); // Collect data every 100ms
        setIsRecordingAudio(true);
      }
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAudioLevel(average / 255);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (err) {
      console.error('Error setting up audio visualization:', err);
    }
  }, [isListening, enableAudioRecording, onAudioRecorded, finalTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsListening(false);
    setInterimTranscript('');
    setAudioLevel(0);
    setRecordingTime(0);
    cleanupAudioContext();
  }, [cleanupAudioContext]);

  const startListening = useCallback(async () => {
    if (!isSupported || disabled) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      setError(null);
      setIsListening(true);
      setRecordingTime(0);
      setInterimTranscript('');
      
      // Setup audio visualization
      await setupAudioVisualization();
      
      // Initialize speech recognition
      recognitionRef.current = new SpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = voiceLang;

        recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        // Start recording timer
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= maxDuration) {
              stopListening();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        setInterimTranscript(interim);
        
        if (final) {
          const newFinalTranscript = finalTranscript + final;
          setFinalTranscript(newFinalTranscript);
          onChange(newFinalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        switch (event.error) {
          case 'not-allowed':
            setError(t.micPermissionDenied);
            break;
          case 'no-speech':
            setError('No speech detected. Please try again.');
            break;
          case 'network':
            setError(t.errors.networkError);
            break;
          default:
            setError(`Speech recognition error: ${event.error}`);
        }
        
        cleanupAudioContext();
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        setAudioLevel(0);
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        cleanupAudioContext();
      };

      // Auto-stop after max duration
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, maxDuration * 1000);

      recognitionRef.current.start();
      }
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start voice input');
      setIsListening(false);
      cleanupAudioContext();
    }
  }, [isSupported, disabled, voiceLang, finalTranscript, onChange, maxDuration, setupAudioVisualization, t.micPermissionDenied, t.errors.networkError, cleanupAudioContext, stopListening]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveRecording = async () => {
    if (!audioBlob) return;

    try {
      setSaving(true);
      
      // Create audio URL for immediate playback
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create voice note data
      const voiceNote: VoiceNote = {
        id: `temp-${Date.now()}`, // Temporary ID
        audioUrl,
        audioBlob,
        transcription: finalTranscript,
        duration: recordingTime,
        fileName: `voice-note-${Date.now()}.webm`,
        fileSize: audioBlob.size,
        mimeType: audioBlob.type,
        createdAt: new Date().toISOString()
      };
      
      // Trigger callback with saved audio data
      if (onSave) {
        onSave(voiceNote);
      }
      
      // Also call legacy callback
      if (onAudioRecorded) {
        onAudioRecorded(audioBlob, finalTranscript);
      }
      
      // Reset state
      setAudioBlob(null);
      setFinalTranscript('');
      setRecordingTime(0);
      onChange('');
      
    } catch (error) {
      console.error('Error saving recording:', error);
      alert('Failed to save voice note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecording = () => {
    if (audioBlob) {
      URL.revokeObjectURL(URL.createObjectURL(audioBlob));
    }
    setAudioBlob(null);
    setFinalTranscript('');
    setRecordingTime(0);
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
        <AlertCircle className="h-4 w-4" />
        <span>
          {t.voiceNotSupported}
        </span>
      </div>
    );
  }

  const currentTranscript = finalTranscript + interimTranscript;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Language Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <label className="text-sm font-medium">{t.voiceLanguage}:</label>
        <Select
          value={voiceLang}
          onValueChange={setVoiceLang}
          disabled={isListening}
        >
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hi-IN">हिंदी</SelectItem>
            <SelectItem value="en-IN">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Voice Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="sm"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className="flex items-center gap-2 justify-center w-full sm:w-auto"
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4" />
              {t.stopListening}
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              {t.tapToSpeak}
            </>
          )}
        </Button>

        {/* Recording Status */}
        {isListening && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="animate-pulse">
                {t.listening}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatTime(recordingTime)}
              </span>
            </div>
            {/* Audio Level Indicator */}
            <div className="flex items-center gap-1 w-full sm:w-auto">
              <Volume2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <div className="w-full sm:w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${audioLevel * 100}%` }}
                />
              </div>
            </div>
            
            {/* Audio Recording Status */}
            {enableAudioRecording && isRecordingAudio && (
              <Badge variant="secondary" className="animate-pulse">
                🎵 Recording Audio
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Live Transcript */}
      {(currentTranscript || isListening) && (
        <div className="p-3 bg-slate-50 rounded-lg border">
          <div className="text-sm leading-relaxed">
            <span className="text-slate-900">{finalTranscript}</span>
            {interimTranscript && (
              <span className="text-slate-500 italic">{interimTranscript}</span>
            )}
            {isListening && !interimTranscript && (
              <span className="text-slate-400 italic">
                {placeholder || t.tapToSpeak}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="text-sm leading-relaxed">{error}</span>
        </div>
      )}

      {/* Audio Player for Recorded Audio */}
      {audioBlob && enableAudioRecording && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-900">Recorded Audio:</div>
          <AudioPlayer
            audioBlob={audioBlob}
            transcript={finalTranscript}
            language={language}
            onDelete={handleDeleteRecording}
            showTranscript={!!finalTranscript}
          />
          {onSave && (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveRecording}
                disabled={saving}
                size="sm"
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save Voice Note'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs leading-relaxed text-muted-foreground">
        {t.descriptionVoiceHelper}
        {enableAudioRecording && ' Audio recording enabled.'}
        {maxDuration && ` Max duration: ${Math.floor(maxDuration / 60)}m`}
      </div>
    </div>
  );
}