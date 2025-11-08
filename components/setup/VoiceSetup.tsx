"use client";

import { useState, useRef } from "react";
import { User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

// Importing icons
import { Mic, Play, Pause, RotateCcw, CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

interface VoiceSetupStepProps {
  user: User;
  onComplete: () => void;
  onSkip?: () => void; // Optional skip callback
}

export function VoiceSetupStep({ user, onComplete, onSkip }: VoiceSetupStepProps) {
  const [userName, setUserName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const RECORDING_DURATION = 10;
  const [countdown, setCountdown] = useState(RECORDING_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => chunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null);
      setCountdown(RECORDING_DURATION);
      setError(null);
      if (audioPlayerRef.current && isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      }
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please grant permission.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (audioBlob && audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioBlob || !userName.trim() || !user) return;
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", userName);
    formData.append("audioFile", audioBlob, "voice-sample.webm");

    try {
      const apiResponse = await fetch("/api/register-user", { method: "POST", body: formData });
      if (!apiResponse.ok) throw new Error("Failed to generate voiceprint.");
      const { voiceprint } = await apiResponse.json();
      if (!voiceprint) throw new Error("API did not return a valid voiceprint.");

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        name: userName,
        email: user.email,
        voiceprint: voiceprint,
        createdAt: new Date(),
      }, { merge: true });
      console.log("User profile created successfully!");
      onComplete(); // Notify parent to move to the next step
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((RECORDING_DURATION - countdown) / RECORDING_DURATION) * 100;
  const circumference = 2 * Math.PI * 56;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="modern-card p-8 w-full max-w-lg fade-in-scale">
      {/* Wizard Header */}
      <div className="text-center mb-8 slide-in-down">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
          STEP 2 OF 3 • Optional
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Create Your Voice Profile
        </h1>
        <p className="text-muted-foreground mt-2">
          A quick 10-second recording helps identify you in meetings
        </p>
      </div>

      <form onSubmit={handleVoiceSubmit} className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-card-foreground block pl-1">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            className="input-field"
            placeholder="Enter your full name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            disabled={isSubmitting || isRecording}
          />
        </div>

        {/* Voice Recording Section */}
        <div className="space-y-3 slide-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          <label className="text-sm font-medium text-foreground block">
            Voice Recording
          </label>
          <div className="p-8 border-2 border-dashed border-border rounded-2xl text-center bg-gradient-accent space-y-5 relative overflow-hidden backdrop-blur-sm">
            {/* Circular Progress Timer */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <svg className="absolute w-full h-full" viewBox="0 0 120 120">
                <circle
                  className="text-muted"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="60"
                  cy="60"
                />
                <circle
                  className="text-primary"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="60"
                  cy="60"
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: isRecording ? strokeDashoffset : circumference,
                    transition: 'stroke-dashoffset 1s linear'
                  }}
                />
              </svg>
              <div className="relative flex flex-col items-center justify-center">
                {isRecording ? (
                    <Mic className="w-8 h-8 text-destructive animate-pulse" />
                ) : (
                    audioBlob ? <CheckCircle className="w-8 h-8 text-green-500"/> : <Mic className="w-8 h-8 text-muted-foreground" />
                )}
                <span className="text-2xl font-mono font-bold text-card-foreground mt-2">
                  {countdown.toString().padStart(2, "0")}s
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {!isRecording && !audioBlob && (
              <button
                type="button"
                onClick={startRecording}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-6 rounded-lg transition-all btn-smooth inline-flex items-center justify-center disabled:opacity-50"
                disabled={isSubmitting || !userName.trim()}
              >
                <Mic className="w-5 h-5 mr-2" /> Start Recording
              </button>
            )}
            {isRecording && (
              <button
                type="button"
                onClick={stopRecording}
                className="w-full inline-flex items-center justify-center bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-3 px-6 rounded-lg transition-all btn-smooth"
                disabled={isSubmitting}
              >
                <Pause className="w-5 h-5 mr-2" /> Stop Recording
              </button>
            )}
            {audioBlob && !isRecording && (
              <div className="space-y-3">
                <p className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" /> Recording Complete!
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={togglePlayback}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all btn-smooth font-medium text-sm ${
                      isPlaying
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-950/30 dark:text-green-200"
                    }`}
                    disabled={isSubmitting}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-lg transition-all btn-smooth text-sm"
                    disabled={isSubmitting}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Re-record
                  </button>
                </div>
                <audio ref={audioPlayerRef} className="hidden" onEnded={() => setIsPlaying(false)} onPause={() => setIsPlaying(false)}></audio>
              </div>
            )}
          </div>
        </div>

        {error && (
            <p className="text-destructive text-sm text-center flex items-center justify-center">
              <XCircle className="w-4 h-4 mr-1.5" /> {error}
            </p>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between gap-4 pt-2">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground transition-colors btn-smooth font-medium"
              disabled={isSubmitting || isRecording}
            >
              Skip for now
            </button>
          )}
          <div className="flex-1" />
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-6 rounded-lg transition-all btn-smooth inline-flex items-center justify-center disabled:opacity-50 group"
            disabled={!audioBlob || !userName.trim() || isSubmitting || isRecording}
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving Profile...</>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
