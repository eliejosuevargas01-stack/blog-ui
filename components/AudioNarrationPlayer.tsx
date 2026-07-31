"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Headphones } from "lucide-react";

interface AudioNarrationPlayerProps {
  audioUrl?: string | null;
  title?: string;
  lang?: string;
}

export default function AudioNarrationPlayer({ audioUrl, title, lang = "pt" }: AudioNarrationPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFloatingVisible, setIsFloatingVisible] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoaded(false);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFloatingVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!audioUrl) {
    return null;
  }

  const updateAudioDuration = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration) && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
      setDuration(audioRef.current.duration);
      setIsLoaded(true);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        updateAudioDuration();
      }).catch((err) => console.error("Erro ao reproduzir áudio:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (duration === 0) {
        updateAudioDuration();
      }
    }
  };

  const handleLoadedMetadata = () => {
    updateAudioDuration();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const changePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0 || !isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const headerText =
    lang === "en" ? "Listen to Article Narration" : lang === "es" ? "Escuchar Narración del Artículo" : "Ouça a Narração deste Post";

  return (
    <>
      <div ref={containerRef} className="w-full my-6 bg-card border border-border/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onDurationChange={updateAudioDuration}
          onCanPlay={updateAudioDuration}
          onEnded={() => setIsPlaying(false)}
          preload="auto"
        />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-secondary font-semibold text-xs uppercase tracking-wider">
              <Headphones size={16} className={isPlaying ? "animate-bounce text-secondary" : "text-secondary/80"} />
              <span>{headerText}</span>
            </div>

            {isPlaying && (
              <div className="flex items-end gap-1 h-3">
                <span className="w-1 bg-secondary animate-[bounce_1s_infinite_100ms] rounded-full h-full" />
                <span className="w-1 bg-secondary animate-[bounce_1s_infinite_300ms] rounded-full h-2/3" />
                <span className="w-1 bg-secondary animate-[bounce_1s_infinite_200ms] rounded-full h-full" />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-1">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
              className="w-12 h-12 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground flex items-center justify-center transition-all transform hover:scale-105 shadow-md shrink-0"
            >
              {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="fill-current ml-0.5" />}
            </button>

            <div className="flex-1 w-full space-y-1">
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration > 0 ? duration : 1}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
                  style={{
                    background: `linear-gradient(to right, var(--secondary, #3b82f6) ${progressPercent}%, var(--muted, #1e293b) ${progressPercent}%)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-foreground/70">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={changePlaybackRate}
                className="text-[11px] font-mono font-semibold text-foreground/80 hover:text-foreground bg-muted border border-border px-2.5 py-1 rounded-lg transition-colors"
                title="Velocidade de reprodução"
              >
                {playbackRate}x
              </button>

              <div className="flex items-center gap-1.5">
                <button type="button" onClick={toggleMute} className="text-foreground/70 hover:text-foreground transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary hidden md:block"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFloatingVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-card/95 backdrop-blur-md border border-border px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pausar narração" : "Reproduzir narração"}
            className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground flex items-center justify-center transition-all transform hover:scale-105 shadow-md shrink-0"
          >
            {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
          </button>

          <div className="flex flex-col cursor-pointer select-none" onClick={togglePlay}>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-foreground tracking-wide uppercase">
                {isPlaying ? "Tocando Narração" : "Narração Pausada"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-foreground/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            type="button"
            onClick={changePlaybackRate}
            className="text-[10px] font-mono font-semibold text-foreground/80 hover:text-foreground bg-muted border border-border px-2 py-0.5 rounded transition-colors ml-1"
          >
            {playbackRate}x
          </button>
        </div>
      )}
    </>
  );
}
