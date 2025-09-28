import React from 'react';
import { Play, Volume2, Users, Heart, Share2 } from 'lucide-react';
import { useAudio } from '../../contexts/AudioContext';
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

interface ChannelCardProps {
  channel: Channel;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel }) => {
  const { loadStream, currentChannel, audioState } = useAudio();
  const { listenerCounts } = useWebSocket();
  
  const currentListeners = listenerCounts[channel.id] || channel.current_listeners;
  const isCurrentlyPlaying = currentChannel === channel.id;

  const handlePlayChannel = () => {
    loadStream(channel.id);
  };

  return (
    <div className={`card-hover group relative overflow-hidden ${
      isCurrentlyPlaying ? 'ring-2 ring-primary' : ''
    }`}>
      {/* Channel Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <img
          src={channel.image_url}
          alt={channel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundColor: channel.color }}
        />
        
        {/* Live Badge */}
        {channel.is_live && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}

        {/* Play Button */}
        <button
          onClick={handlePlayChannel}
          disabled={audioState.isLoading && isCurrentlyPlaying}
          className={`absolute bottom-2 left-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isCurrentlyPlaying
              ? 'bg-green-500 text-white scale-110'
              : 'bg-black/50 text-white hover:bg-black/70 hover:scale-105 opacity-0 group-hover:opacity-100'
          } ${audioState.isLoading && isCurrentlyPlaying ? 'opacity-50' : ''}`}
        >
          {audioState.isLoading && isCurrentlyPlaying ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          <h3 className="font-semibold text-foreground line-clamp-1 flex-1 mr-2">{channel.name}</h3>
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
};