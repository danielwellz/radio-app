// frontend/src/contexts/AudioContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AudioState {
  isPlaying: boolean
  volume: number
  currentTime: number
  duration: number
  isLoading: boolean
}

interface NowPlaying {
  track?: {
    id: string
    title: string
    artist: string
    album: string
    duration: number
    affiliateLinks?: Record<string, string>
  }
  channel?: {
    id: string
    name: string
    genre: string
    listeners: number
  }
}

interface AudioContextType {
  audioState: AudioState
  nowPlaying: NowPlaying | null
  loadStream: (url: string, channelId: string) => void
  play: () => void
  pause: () => void
  setVolume: (volume: number) => void
  setNowPlaying: (data: NowPlaying) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    isLoading: false
  })

  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null)

  const loadStream = (url: string, channelId: string) => {
    setAudioState(prev => ({ ...prev, isLoading: true }))
    
    // Simulate stream loading
    setTimeout(() => {
      setAudioState(prev => ({ ...prev, isLoading: false, isPlaying: true }))
      
      // Mock now playing data
      setNowPlaying({
        track: {
          id: '1',
          title: 'Current Track',
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          duration: 180,
          affiliateLinks: {
            itunes: '#',
            spotify: '#'
          }
        },
        channel: {
          id: channelId,
          name: 'Demo Channel',
          genre: 'Various',
          listeners: 42
        }
      })
    }, 1000)
  }

  const play = () => setAudioState(prev => ({ ...prev, isPlaying: true }))
  const pause = () => setAudioState(prev => ({ ...prev, isPlaying: false }))
  const setVolume = (volume: number) => setAudioState(prev => ({ ...prev, volume }))

  return (
    <AudioContext.Provider value={{
      audioState,
      nowPlaying,
      loadStream,
      play,
      pause,
      setVolume,
      setNowPlaying
    }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}