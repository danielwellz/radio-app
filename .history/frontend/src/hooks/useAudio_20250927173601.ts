// frontend/src/hooks/useAudio.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { Howl, Howler } from 'howler';
import { useWebSocket } from './useWebSocket';

export interface AudioState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  quality: string;
  isLive: boolean;
}

export interface NowPlaying {
  track: {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    affiliateLinks?: Record<string, string>;
  };
  channel: {
    id: string;
    name: string;
    genre: string;
    listeners: number;
  };
  progress: number;
}

export const useAudio = () => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    quality: 'high',
    isLive: false
  });

  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const soundRef = useRef<Howl | null>(null);
  const { sendMessage, lastMessage } = useWebSocket();

  // Background playback support
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && soundRef.current) {
        // Keep playing in background
        console.log('App in background, audio continues...');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadStream = useCallback((url: string, channelId: string, options = {}) => {
    if (soundRef.current) {
      soundRef.current.unload();
    }

    setAudioState(prev => ({ ...prev, isLoading: true }));

    soundRef.current = new Howl({
      src: [url],
      html5: true,
      format: ['mp3', 'aac', 'm3u8'],
      volume: audioState.volume,
      onload: () => {
        setAudioState(prev => ({ ...prev, isLoading: false }));
        // Request current track info
        sendMessage({ type: 'get_now_playing', channelId });
      },
      onplay: () => {
        setAudioState(prev => ({ ...prev, isPlaying: true }));
      },
      onpause: () => {
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      },
      onstop: () => {
        setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      },
      onend: () => {
        setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      },
      onloaderror: (id, error) => {
        console.error('Audio load error:', error);
        setAudioState(prev => ({ ...prev, isLoading: false }));
      },
      onplayerror: () => {
        // Try fallback quality
        if (audioState.quality === 'high') {
          console.log('Trying medium quality...');
          setAudioState(prev => ({ ...prev, quality: 'medium' }));
        }
      },
      ...options
    });

    // Update progress
    const updateProgress = () => {
      if (soundRef.current && soundRef.current.playing()) {
        const currentTime = soundRef.current.seek() as number;
        setAudioState(prev => ({ ...prev, currentTime }));
        
        // Update progress every second for live streams
        if (audioState.isLive) {
          sendMessage({ 
            type: 'progress_update', 
            channelId, 
            progress: currentTime 
          });
        }
      }
    };

    setInterval(updateProgress, 1000);
  }, [audioState.volume, audioState.quality, audioState.isLive, sendMessage]);

  const play = useCallback(() => {
    soundRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    soundRef.current?.pause();
  }, []);

  const setVolume = useCallback((volume: number) => {
    Howler.volume(volume);
    setAudioState(prev => ({ ...prev, volume }));
  }, []);

  const seek = useCallback((time: number) => {
    if (soundRef.current) {
      soundRef.current.seek(time);
      setAudioState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  // Handle WebSocket messages for real-time updates
  useEffect(() => {
    if (lastMessage) {
      const message = JSON.parse(lastMessage.data);
      
      switch (message.type) {
        case 'now_playing':
          setNowPlaying(message.data);
          break;
        case 'listener_count':
          setNowPlaying(prev => prev ? {
            ...prev,
            channel: { ...prev.channel, listeners: message.count }
          } : null);
          break;
        case 'user_message':
          // Show dedication/shoutout notification
          showUserMessage(message.data);
          break;
      }
    }
  }, [lastMessage]);

  const showUserMessage = (data: any) => {
    // Implementation for showing user messages
    if (data.type === 'dedication') {
      console.log(`Dedication from user: ${data.message}`);
    }
  };

  return {
    audioState,
    nowPlaying,
    loadStream,
    play,
    pause,
    setVolume,
    seek,
    setNowPlaying
  };
};