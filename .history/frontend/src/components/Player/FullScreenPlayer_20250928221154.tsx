import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Share2, Shrink, MessageCircle } from 'lucide-react';
import { useAudio } from '../../contexts/AudioContext';

export const FullScreenPlayer: React.FC = () => {
  const { audioState, nowPlaying, togglePlay, setVolume, setPlayerExpanded, sendDedication } = useAudio();

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
    <div className="fixed inset-0 bg-background z-50 animate-fade-in">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <button 
          onClick={() => setPlayerExpanded(false)}
          className="text-foreground p-2"
        >
          <Shrink size={24} />
        </button>
        <div className="text-center">
          <div className="font-semibold">Now Playing</div>
          <div className="text-sm text-muted-foreground">{nowPlaying.channel.name}</div>
        </div>
        <div className="w-10"></div> {/* Spacer for balance */}
      </div>

      {/* Album Art */}
      <div className="flex items-center justify-center h-full px-8">
        <div className="text-center">
          <div className="w-64 h-64 mx-auto mb-8 rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={nowPlaying.track.coverArt} 
              alt={nowPlaying.track.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">{nowPlaying.track.title}</h2>
          <p className="text-lg text-muted-foreground mb-1">{nowPlaying.track.artist}</p>
          <p className="text-sm text-muted-foreground">{nowPlaying.track.album}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-32 left-4 right-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>{formatTime(audioState.currentTime)}</span>
          <span>{formatTime(audioState.duration)}</span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between mb-6">
          <button className="text-muted-foreground hover:text-foreground">
            <Heart size={24} />
          </button>
          
          <div className="flex items-center space-x-6">
            <button className="text-muted-foreground hover:text-foreground">
              <SkipBack size={24} />
            </button>
            
            <button 
              onClick={togglePlay}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 transition-colors duration-200"
            >
              {audioState.isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>
            
            <button className="text-muted-foreground hover:text-foreground">
              <SkipForward size={24} />
            </button>
          </div>
          
          <button className="text-muted-foreground hover:text-foreground">
            <Share2 size={24} />
          </button>
        </div>

        {/* Volume and Extra Controls */}
        <div className="flex items-center justify-between">
          <button className="text-muted-foreground hover:text-foreground">
            <MessageCircle size={20} />
          </button>
          
          <div className="flex items-center space-x-3 flex-1 max-w-xs mx-4">
            <Volume2 size={20} className="text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audioState.volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          
          <button className="text-muted-foreground hover:text-foreground">
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};