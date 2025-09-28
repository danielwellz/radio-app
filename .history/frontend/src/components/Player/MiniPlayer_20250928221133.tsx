import React from 'react';
import { Play, Pause, Volume2, Expand } from 'lucide-react';
import { useAudio } from '../../contexts/AudioContext';

export const MiniPlayer: React.FC = () => {
  const { audioState, nowPlaying, togglePlay, setPlayerExpanded } = useAudio();

  if (!nowPlaying) {
    return null;
  }

  const progressPercentage = audioState.duration > 0 
    ? (audioState.currentTime / audioState.duration) * 100 
    : 0;

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

        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
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
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={togglePlay}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 transition-colors duration-200"
            >
              {audioState.isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button 
              onClick={() => setPlayerExpanded(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Expand size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};