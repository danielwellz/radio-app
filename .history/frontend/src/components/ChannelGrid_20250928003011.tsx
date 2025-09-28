// frontend/src/components/ChannelGrid.tsx - MOBILE OPTIMIZED
import React, { useEffect, useState } from 'react';
import { Play, Users, Clock, Heart, Share2, Volume2 } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useWebSocket } from '../contexts/WebSocketContext';

interface Channel {
  id: string;
  name: string;
  description: string;
  genre: string;
  current_listeners: number;
  is_live: boolean;
  image_url: string;
  color: string;
  schedule?: Record<string, string[]>;
}

interface ChannelGridProps {
  searchQuery: string;
}

export const ChannelGrid: React.FC<ChannelGridProps> = ({ searchQuery }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const { loadStream, audioState, currentChannel } = useAudio();
  const { listenerCounts } = useWebSocket();

  const genres = ['All', 'Lo-Fi', 'Electronic', 'Jazz', 'Hip-Hop', 'Acoustic'];

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels');
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching channels:', error);
      // Fallback to mock data
      setChannels([
        {
          id: '1',
          name: 'Chill Lo-Fi',
          description: 'Relaxing lo-fi beats to study and chill',
          genre: 'Lo-Fi',
          current_listeners: 1242,
          is_live: true,
          image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
          color: '#4F46E5'
        },
        // ... other channels
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         channel.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || channel.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handlePlayChannel = (channel: Channel) => {
    loadStream(channel.id);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-muted rounded-lg mb-3"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Genre Filter */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedGenre === genre
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Channels Grid */}
      <div className="channel-grid">
        {filteredChannels.map(channel => {
          const currentListeners = listenerCounts[channel.id] || channel.current_listeners;
          const isCurrentlyPlaying = currentChannel === channel.id;
          
          return (
            <div
              key={channel.id}
              className={`card group relative overflow-hidden ${
                isCurrentlyPlaying ? 'ring-2 ring-primary' : ''
              }`}
            >
              {/* Channel Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                <img
                  src={channel.image_url}
                  alt={channel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundColor: channel.color }}
                ></div>
                
                {/* Live Badge */}
                {channel.is_live && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </div>
                )}

                {/* Play Button */}
                <button
                  onClick={() => handlePlayChannel(channel)}
                  disabled={audioState.isLoading && currentChannel === channel.id}
                  className={`absolute bottom-2 left-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCurrentlyPlaying
                      ? 'bg-green-500 text-white scale-110'
                      : 'bg-black/50 text-white hover:bg-black/70 hover:scale-105'
                  } ${audioState.isLoading && currentChannel === channel.id ? 'opacity-50' : ''}`}
                >
                  {audioState.isLoading && currentChannel === channel.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isCurrentlyPlaying ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>

                {/* Listener Count */}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {currentListeners}
                </div>
              </div>

              {/* Channel Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground line-clamp-1 flex-1">{channel.name}</h3>
                  <button className="text-muted-foreground hover:text-foreground p-1">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">{channel.description}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-muted rounded-full">{channel.genre}</span>
                  <div className="flex items-center gap-3">
                    <button className="hover:text-foreground">
                      <Share2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredChannels.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">No channels found matching your criteria</div>
        </div>
      )}
    </div>
  );
};