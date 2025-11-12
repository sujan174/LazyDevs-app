"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { X, Upload, FileAudio, Loader2, Info } from 'lucide-react';
import { useUploadModal } from '../../contexts/UploadModalProvider';

interface UploadMeetingModalProps {
  user: User;
}

export function UploadModal({ user }: UploadMeetingModalProps) {
  const { isUploadModalOpen, closeUploadModal } = useUploadModal();
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (!isUploadModalOpen) return null;
  
  const resetState = () => {
    setDragActive(false);
    setIsProcessing(false);
    setSelectedFile(null);
    setMeetingTitle('');
    setError(null);
    setProcessingStatus('');
  };

  const handleClose = () => {
    resetState();
    closeUploadModal();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles([e.dataTransfer.files[0]]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles([e.target.files[0]]);
    }
  };

  const handleFiles = (files: File[]) => {
    const audioFile = files.find(file => 
      file.type.startsWith('audio/') || 
      file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)
    );
    if (!audioFile) {
      setError('Please select a valid audio file.');
      return;
    }
    setSelectedFile(audioFile);
  };

  const handleUpload = async () => {
    if (!selectedFile || !meetingTitle.trim() || !user) {
      setError('Please provide a title and select a file.');
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      setProcessingStatus('Preparing upload...');
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists() || !userDoc.data().teamId) {
        throw new Error("Could not find your team information. Please try again.");
      }
      const teamId = userDoc.data().teamId;

      setProcessingStatus('Fetching team voiceprints...');
      const voiceprintsRes = await fetch(`/api/teams/${teamId}/voiceprints`);
      if (!voiceprintsRes.ok) throw new Error('Could not fetch team voiceprints.');
      const { voiceprints } = await voiceprintsRes.json();

      setProcessingStatus('Transcribing audio & identifying speakers...');
      const processFormData = new FormData();
      processFormData.append('audioFile', selectedFile);
      processFormData.append('voiceprints', JSON.stringify(voiceprints));
      
      const processRes = await fetch('/api/transcribe-meeting', {
        method: 'POST',
        body: processFormData,
      });
      if (!processRes.ok) throw new Error('Failed to process the audio recording.');
      const processedData = await processRes.json();

      setProcessingStatus('Saving meeting transcript...');
      const saveRes = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          meetingTitle,
          transcript: processedData.transcript,
          speakerMap: processedData.speaker_map,
          unresolvedSpeakers: processedData.unresolved_speakers,
          uploadedBy: user.uid,
        }),
      });
      if (!saveRes.ok) throw new Error('Failed to save the meeting transcript.');
      const { meetingId } = await saveRes.json();
      
      handleClose();
      router.push(`/dashboard/meetings/${meetingId}`);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
     className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
     onClick={handleClose}
    >
      <div
        className="relative modern-card w-full max-w-lg mx-4 bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Upload Meeting Recording</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
           <div>
            <label htmlFor="meeting-title" className="block text-sm font-medium text-foreground mb-2">
              Meeting Title
            </label>
            <input
              type="text"
              id="meeting-title"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="e.g., Q4 Project Kickoff"
              className="input-field"
              disabled={isProcessing}
            />
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border bg-muted/30'
            }`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-sm text-foreground font-medium">{processingStatus}</p>
              </div>
            ) : selectedFile ? (
              <div className="flex flex-col items-center">
                <FileAudio className="w-12 h-12 text-success mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <button onClick={() => setSelectedFile(null)} className="mt-3 text-xs text-destructive hover:underline">
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-foreground mb-2">
                  Drag and drop an audio file here, or
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                >
                  browse to upload
                </button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports MP3, WAV, M4A, etc.
                </p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
            onChange={handleFileSelect} className="hidden"
          />
        </div>

        {error && (
            <div className="px-6 pb-2">
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg flex items-center text-sm border border-destructive/20">
                    <Info className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            </div>
        )}

        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={handleClose}
            className="btn-secondary"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isProcessing || !selectedFile || !meetingTitle.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {isProcessing ? 'Processing...' : 'Upload & Transcribe'}
          </button>
        </div>
      </div>
    </div>
  );
}

