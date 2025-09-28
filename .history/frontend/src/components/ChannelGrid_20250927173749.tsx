// frontend/src/components/ChannelGrid.tsx
import React, { useEffect, useState } from 'react';
import { Play, Users, Clock } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface Channel {
  id: string;
  name: string;
  description: string;
  genre: string;
  current_listeners: number;
  is_live: boolean;
  image_url?: string;
}

export const ChannelGrid: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const { loadStream, play, audioState } = useAudio();

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/v1/channels');
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelSelect = async (channel: Channel) => {
    try {
      // Get stream URL for channel
      const response = await fetch(`/api/v1/channels/${channel.id}/stream`);
      const streamData = await response.json();
      
      loadStream(streamData.url, channel.id);
      play();
    } catch (error) {
      console.error('Error loading channel:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading channels...</div>;
  }

  return (
    <div className="channel-grid">
      {channels.map(channel => (
        <div key={channel.id} className="channel-card">
          <div className="channel-image">
            {channel.image_url ? (
              <img src={channel.image_url} alt={channel.name} />
            ) : (
              <div className="channel-placeholder">{channel.name.charAt(0)}</div>
            )}
            {channel.is_live && <div className="live-badge">LIVE</div>}
          </div>
          
          <div className="channel-info">
            <h3>{channel.name}</h3>
            <p className="channel-genre">{channel.genre}</p>
            <p className="channel-description">{channel.description}</p>
            
            <div className="channel-stats">
              <span><Users size={16} /> {channel.current_listeners}</span>
              <span><Clock size={16} /> 24/7</span>
            </div>
          </div>
          
          <button 
            className="play-button"
            onClick={() => handleChannelSelect(channel)}
            disabled={audioState.isLoading}
          >
            <Play size={20} />
            {audioState.isLoading ? 'Loading...' : 'Play'}
          </button>
        </div>
      ))}
    </div>
  );
};