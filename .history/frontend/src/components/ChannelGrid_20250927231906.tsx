// frontend/src/components/ChannelGrid.tsx
import React from 'react'
import { Play, Users } from 'lucide-react'
import { useAudio } from '../contexts/AudioContext'

const mockChannels = [
  {
    id: '1',
    name: 'Chill Lo-Fi Radio',
    description: 'Relaxing lo-fi beats to study and chill',
    genre: 'Lo-Fi',
    listeners: 150,
    imageUrl: 'https://via.placeholder.com/300x300/4A5568/FFFFFF?text=Lo-Fi'
  },
  {
    id: '2',
    name: 'Electronic Dance',
    description: 'The best EDM and electronic music',
    genre: 'Electronic', 
    listeners: 89,
    imageUrl: 'https://via.placeholder.com/300x300/805AD5/FFFFFF?text=EDM'
  },
  {
    id: '3',
    name: 'Jazz Classics',
    description: 'Timeless jazz classics from the greats',
    genre: 'Jazz',
    listeners: 42,
    imageUrl: 'https://via.placeholder.com/300x300/38A169/FFFFFF?text=Jazz'
  }
]

export const ChannelGrid: React.FC = () => {
  const { loadStream, audioState } = useAudio()

  const handlePlayChannel = (channelId: string) => {
    // For demo, use a mock stream URL
    loadStream(`https://mock-stream.com/${channelId}`, channelId)
  }

  return (
    <div className="channel-grid">
      {mockChannels.map(channel => (
        <div key={channel.id} className="channel-card">
          <div className="relative">
            <img 
              src={channel.imageUrl} 
              alt={channel.name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
              LIVE
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-xl font-bold mb-2">{channel.name}</h3>
            <p className="text-gray-400 text-sm mb-2">{channel.genre}</p>
            <p className="text-gray-300 mb-4">{channel.description}</p>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-400">
                <Users size={16} className="mr-1" />
                <span>{channel.listeners} listeners</span>
              </div>
              
              <button
                onClick={() => handlePlayChannel(channel.id)}
                disabled={audioState.isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center"
              >
                <Play size={16} className="mr-2" />
                {audioState.isLoading ? 'Loading...' : 'Play'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}