import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface AudioState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  quality: 'low' | 'medium' | 'high';
  isLive: boolean;
  playbackRate: number;
}

interface NowPlaying {
  track: {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    coverArt: string;
    affiliateLinks: Record<string, string>;
  };
  channel: {
    id: string;
    name: string;
    genre: string;
    listeners: number;
    imageUrl: string;
    color: string;
  };
  progress: number;
  startTime: string;
}

interface AudioContextType {
  audioState: AudioState;
  nowPlaying: NowPlaying | null;
  currentChannel: string | null;
  loadStream: (channelId: string, autoPlay?: boolean) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setQuality: (quality: 'low' | 'medium' | 'high') => void;
  sendDedication: (message: string, userName?: string) => void;
  likeTrack: () => void;
  shareTrack: (platform: string) => void;
  isPlayerExpanded: boolean;
  setPlayerExpanded: (expanded: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    volume: 0.8,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    quality: 'high',
    isLive: true,
    playbackRate: 1.0
  });

  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [isPlayerExpanded, setPlayerExpanded] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  // Mock data for channels and tracks
  const MOCK_CHANNELS = [
    {
      id: '1',
      name: 'Chill Lo-Fi',
      description: 'Relaxing lo-fi beats to study and chill',
      genre: 'Lo-Fi',
      current_listeners: 1242,
      is_live: true,
      image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
      color: '#B45309'
    },
    {
      id: '2',
      name: 'Deep Focus',
      description: 'Minimal electronic for deep work',
      genre: 'Electronic',
      current_listeners: 876,
      is_live: true,
      image_url: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
      color: '#0F766E'
    }
  ];

  const MOCK_TRACKS = {
    '1': [
      {
        id: '101',
        title: 'Sunset Dreams',
        artist: 'Lofi Producer',
        album: 'Chill Vibes',
        duration: 183,
        coverArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
        affiliateLinks: {}
      }
    ],
    '2': [
      {
        id: '201',
        title: 'Digital Ocean',
        artist: 'Deep Focus',
        album: 'Productive Hours',
        duration: 324,
        coverArt: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop',
        affiliateLinks: {}
      }
    ]
  };

  const loadStream = useCallback(async (channelId: string, autoPlay: boolean = true) => {
    setAudioState(prev => ({ ...prev, isLoading: true }));
    setCurrentChannel(channelId);

    try {
      // Use mock data instead of API calls for now
      const channel = MOCK_CHANNELS.find(c => c.id === channelId);
      const tracks = MOCK_TRACKS[channelId as keyof typeof MOCK_TRACKS];

      if (!channel || !tracks) {
        throw new Error('Channel not found');
      }

      const currentTrack = tracks[0];

      // Simulate stream loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      setNowPlaying({
        track: currentTrack,
        channel: {
          id: channel.id,
          name: channel.name,
          genre: channel.genre,
          listeners: channel.current_listeners,
          imageUrl: channel.image_url,
          color: channel.color
        },
        progress: 0,
        startTime: new Date().toISOString()
      });

      setAudioState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isPlaying: autoPlay,
        duration: currentTrack.duration
      }));

      if (autoPlay) {
        startProgressSimulation();
      }

    } catch (error) {
      console.error('Error loading stream:', error);
      setAudioState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const startProgressSimulation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setAudioState(prev => {
        if (!prev.isPlaying || prev.currentTime >= prev.duration) {
          return prev;
        }
        return {
          ...prev,
          currentTime: prev.currentTime + 1
        };
      });

      setNowPlaying(prev => prev ? {
        ...prev,
        progress: prev.progress + 1
      } : null);
    }, 1000);
  }, []);

  const play = useCallback(() => {
    setAudioState(prev => ({ ...prev, isPlaying: true }));
    startProgressSimulation();
  }, [startProgressSimulation]);

  const pause = useCallback(() => {
    setAudioState(prev => ({ ...prev, isPlaying: false }));
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (audioState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [audioState.isPlaying, play, pause]);

  const setVolume = useCallback((volume: number) => {
    setAudioState(prev => ({ ...prev, volume }));
  }, []);

  const seek = useCallback((time: number) => {
    setAudioState(prev => ({ ...prev, currentTime: time }));
    setNowPlaying(prev => prev ? { ...prev, progress: time } : null);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setAudioState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  const setQuality = useCallback((quality: 'low' | 'medium' | 'high') => {
    setAudioState(prev => ({ ...prev, quality }));
  }, []);

  const sendDedication = useCallback(async (message: string, userName: string = 'Listener') => {
    if (!currentChannel) return;

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userName,
          channel_id: currentChannel,
          type: 'dedication',
          content: message
        })
      });
    } catch (error) {
      console.error('Error sending dedication:', error);
    }
  }, [currentChannel]);

  const likeTrack = useCallback(async () => {
    if (!nowPlaying) return;
    console.log('Liked track:', nowPlaying.track.title);
  }, [nowPlaying]);

  const shareTrack = useCallback(async (platform: string) => {
    if (!nowPlaying) return;

    const shareUrl = window.location.href;
    const text = `Listening to "${nowPlaying.track.title}" by ${nowPlaying.track.artist} on ${nowPlaying.channel.name}`;

    if (navigator.share) {
      navigator.share({ title: text, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  }, [nowPlaying]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return (
    <AudioContext.Provider value={{
      audioState,
      nowPlaying,
      currentChannel,
      loadStream,
      play,
      pause,
      togglePlay,
      setVolume,
      seek,
      setPlaybackRate,
      setQuality,
      sendDedication,
      likeTrack,
      shareTrack,
      isPlayerExpanded,
      setPlayerExpanded
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};