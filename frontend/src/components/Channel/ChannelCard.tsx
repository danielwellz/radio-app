import React from 'react';
import { Play, Volume2, Users, Heart, Share2 } from 'lucide-react';
import { useAudio } from '../../contexts/AudioContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement like functionality
    console.log('Liked channel:', channel.name);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: `Listen to ${channel.name} on WaveRadio`,
        text: channel.description,
        url: window.location.href,
      });
    }
  };

  return (
    <Card hover className="group relative overflow-hidden">
      {/* Channel Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <img
          src={channel.image_url}
          alt={channel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Color Overlay */}
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
        <Button
          onClick={handlePlayChannel}
          disabled={audioState.isLoading && isCurrentlyPlaying}
          variant="primary"
          size="sm"
          className={`absolute bottom-2 left-2 transition-all ${
            isCurrentlyPlaying
              ? 'scale-110 bg-green-500 hover:bg-green-600'
              : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
          }`}
        >
          {audioState.isLoading && isCurrentlyPlaying ? (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isCurrentlyPlaying ? (
            <Volume2 size={14} />
          ) : (
            <Play size={14} className="ml-0.5" />
          )}
        </Button>

        {/* Listener Count */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center backdrop-blur-sm">
          <Users size={12} className="mr-1" />
          {currentListeners.toLocaleString()}
        </div>
      </div>

      {/* Channel Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-foreground line-clamp-1 flex-1 mr-2">{channel.name}</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="p-1 h-6 w-6"
            >
              <Heart size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-1 h-6 w-6"
            >
              <Share2 size={14} />
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">{channel.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="px-2 py-1 bg-muted/30 text-foreground rounded-full text-xs">
            {channel.genre}
          </span>
          
          {isCurrentlyPlaying && (
            <div className="flex items-center text-xs text-primary font-medium">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-1" />
              Now Playing
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};