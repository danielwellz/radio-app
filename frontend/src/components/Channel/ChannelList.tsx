import React, { useEffect, useState } from 'react';
import { ChannelCard } from './ChannelCard';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { Button } from '../ui/Button';
import { Search, Filter } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  description: string;
  genre: string;
  current_listeners: number;
  is_live: boolean;
  image_url: string;
  color: string;
}

interface ChannelListProps {
  searchQuery: string;
}

export const ChannelList: React.FC<ChannelListProps> = ({ searchQuery }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const { listenerCounts } = useWebSocket();

  const genres = ['All', 'Lo-Fi', 'Electronic', 'Jazz', 'Hip-Hop', 'Acoustic', 'Rock', 'Classical'];

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
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
        },
        {
          id: '3',
          name: 'Jazz Lounge',
          description: 'Smooth jazz and classic standards',
          genre: 'Jazz',
          current_listeners: 543,
          is_live: false,
          image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67b7f6?w=400&h=400&fit=crop',
          color: '#059669'
        }
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

  if (loading) {
    return (
      <div className="p-4">
        <div className="channel-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-muted rounded-xl mb-3"></div>
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
      {/* Filter Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">All Channels</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={Filter}
          >
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mb-4 p-3 bg-secondary rounded-xl">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedGenre === genre
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-foreground hover:bg-background/80'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Channels Grid */}
      <div className="channel-grid">
        {filteredChannels.map(channel => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>

      {filteredChannels.length === 0 && (
        <div className="text-center py-12">
          <Search size={48} className="text-muted-foreground mx-auto mb-4" />
          <div className="text-muted-foreground">No channels found matching your criteria</div>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSelectedGenre('All');
              // Clear search query if needed
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};