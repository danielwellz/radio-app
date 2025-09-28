import React from 'react';
import { Play, Pause, Volume2, Expand, Heart, Share2 } from 'lucide-react';
import { useAudio } from '../../contexts/AudioContext';
import { Button } from '../ui/Button';

export const MiniPlayer: React.FC = () => {
  const { audioState, nowPlaying, togglePlay, setPlayerExpanded, likeTrack, shareTrack } = useAudio();

  if (!nowPlaying) {
    return null;
  }

  const progressPercentage = audioState.duration > 0 
    ? (audioState.currentTime / audioState.duration) * 100 
    : 0;

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player-container animate-slide-up">
      <div className="container mx-auto px-4 py-3">
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="w-full bg-border rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Track Info */}
          <div 
            className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer"
            onClick={() => setPlayerExpanded(true)}
          >
            <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
              <img 
                src={nowPlaying.track.coverArt} 
                alt={nowPlaying.track.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground truncate">
                {nowPlaying.track.title}
              </div>
              <div className="text-muted-foreground text-sm truncate">
                {nowPlaying.track.artist} • {nowPlaying.channel.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTime(audioState.currentTime)} / {formatTime(audioState.duration)}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={likeTrack}
              className="p-2"
            >
              <Heart size={16} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => shareTrack('native')}
              className="p-2"
            >
              <Share2 size={16} />
            </Button>
            
            <Button 
              onClick={togglePlay}
              variant="primary"
              size="sm"
              className="p-2"
            >
              {audioState.isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPlayerExpanded(true)}
              className="p-2"
            >
              <Expand size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};