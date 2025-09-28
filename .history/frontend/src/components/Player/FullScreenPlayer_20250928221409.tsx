import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Share2, Shrink, MessageCircle, Clock } from 'lucide-react';
import { useAudio } from '../../contexts/AudioContext';
import { Button } from '../ui/Button';

export const FullScreenPlayer: React.FC = () => {
  const { audioState, nowPlaying, togglePlay, setVolume, setPlayerExpanded, likeTrack, shareTrack, sendDedication } = useAudio();
  const [dedicationText, setDedicationText] = useState('');
  const [showDedication, setShowDedication] = useState(false);

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

  const handleSendDedication = () => {
    if (dedicationText.trim()) {
      sendDedication(dedicationText);
      setDedicationText('');
      setShowDedication(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 animate-fade-in flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPlayerExpanded(false)}
          icon={Shrink}
        >
          Close
        </Button>
        
        <div className="text-center">
          <div className="font-semibold">Now Playing</div>
          <div className="text-sm text-muted-foreground">{nowPlaying.channel.name}</div>
        </div>
        
        <div className="w-20"></div> {/* Spacer for balance */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Album Art */}
        <div className="w-64 h-64 mx-auto mb-8 rounded-2xl overflow-hidden shadow-lg">
          <img 
            src={nowPlaying.track.coverArt} 
            alt={nowPlaying.track.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Track Info */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">{nowPlaying.track.title}</h2>
          <p className="text-lg text-muted-foreground mb-1">{nowPlaying.track.artist}</p>
          <p className="text-sm text-muted-foreground">{nowPlaying.track.album}</p>
          
          {/* Listener Count */}
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>{formatTime(audioState.currentTime)} / {formatTime(audioState.duration)}</span>
            <span>•</span>
            <span>{nowPlaying.channel.listeners} listeners</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mb-8">
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

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <Button variant="ghost" size="lg" onClick={likeTrack}>
            <Heart size={24} />
          </Button>
          
          <Button variant="ghost" size="lg">
            <SkipBack size={24} />
          </Button>
          
          <Button 
            onClick={togglePlay}
            variant="primary"
            size="lg"
            className="w-16 h-16"
          >
            {audioState.isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </Button>
          
          <Button variant="ghost" size="lg">
            <SkipForward size={24} />
          </Button>
          
          <Button variant="ghost" size="lg" onClick={() => shareTrack('native')}>
            <Share2 size={24} />
          </Button>
        </div>

        {/* Volume and Extra Controls */}
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-6">
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

          {/* Dedication Button */}
          <Button
            variant="outline"
            onClick={() => setShowDedication(!showDedication)}
            icon={MessageCircle}
            className="w-full"
          >
            Send Dedication
          </Button>

          {/* Dedication Input */}
          {showDedication && (
            <div className="mt-4 p-4 bg-secondary rounded-xl">
              <textarea
                value={dedicationText}
                onChange={(e) => setDedicationText(e.target.value)}
                placeholder="Type your dedication message..."
                className="w-full bg-background border border-border rounded-lg p-3 text-sm mb-3 resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDedication(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendDedication}
                  className="flex-1"
                  disabled={!dedicationText.trim()}
                >
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};