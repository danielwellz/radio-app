import React, { useEffect, useState } from 'react';
import { ChannelCard } from './ChannelCard';
import { useWebSocket } from '../../contexts/WebSocketContext';

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
          color: '#B45309'
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

  if (loading) {
    return (
      <div className="p-4">
        <GenreFilter genres={genres} selectedGenre={selectedGenre} onGenreChange={setSelectedGenre} />
        <div className="channel-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-muted rounded-xl mb-3" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <GenreFilter genres={genres} selectedGenre={selectedGenre} onGenreChange={setSelectedGenre} />
      
      <div className="channel-grid">
        {filteredChannels.map(channel => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>

      {filteredChannels.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">No channels found matching your criteria</div>
        </div>
      )}
    </div>
  );
};

// Genre Filter Component
interface GenreFilterProps {
  genres: string[];
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ genres, selectedGenre, onGenreChange }) => {
  return (
    <div className="mb-6">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
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
  );
};