// frontend/src/components/AudioPlayer.tsx
import React from 'react'
import { Play, Pause, Volume2, Share2, Heart } from 'lucide-react'
import { useAudio } from '../contexts/AudioContext'

export const AudioPlayer: React.FC = () => {
  const { audioState, nowPlaying, play, pause, setVolume } = useAudio()

  if (!nowPlaying) {
    return (
      <div className="audio-player">
        <div className="text-center text-gray-400 py-4">
          Select a channel to start listening
        </div>
      </div>
    )
  }

  return (
    <div className="audio-player">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-600 rounded"></div>
            <div>
              <div className="font-semibold">{nowPlaying.track?.title || 'Unknown Track'}</div>
              <div className="text-gray-400 text-sm">{nowPlaying.track?.artist || 'Unknown Artist'}</div>
              <div className="text-gray-500 text-xs">{nowPlaying.channel?.name}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-6">
            <button className="text-gray-400 hover:text-white">
              <Heart size={20} />
            </button>
            
            <button 
              onClick={audioState.isPlaying ? pause : play}
              className="bg-white text-black rounded-full p-3 hover:bg-gray-200"
            >
              {audioState.isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button className="text-gray-400 hover:text-white">
              <Share2 size={20} />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2">
            <Volume2 size={20} className="text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audioState.volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-600 rounded-full h-1">
            <div 
              className="bg-blue-500 h-1 rounded-full"
              style={{ width: `${(audioState.currentTime / audioState.duration) * 100 || 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}