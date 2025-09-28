// frontend/src/components/AudioPlayer.tsx
import React from 'react';
import { Play, Pause, Volume2, Share, Heart, Download } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

export const AudioPlayer: React.FC = () => {
  const { audioState, nowPlaying, play, pause, setVolume, seek } = useAudio();

  const handleShare = async () => {
    if (nowPlaying) {
      try {
        await navigator.share({
          title: `Listening to ${nowPlaying.track.title} on ${nowPlaying.channel.name}`,
          text: `Check out this track on ${nowPlaying.channel.name} radio!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const handleLike = () => {
    // Send like to backend
    console.log('Liked track:', nowPlaying?.track.title);
  };

  const handleAffiliateClick = (platform: string, url: string) => {
    // Track affiliate click and open link
    window.open(url, '_blank');
  };

  if (!nowPlaying) {
    return (
      <div className="audio-player loading">
        <div>Select a channel to start listening</div>
      </div>
    );
  }

  return (
    <div className="audio-player">
      <div className="now-playing">
        <div className="track-info">
          <div className="track-title">{nowPlaying.track.title}</div>
          <div className="track-artist">{nowPlaying.track.artist}</div>
          <div className="channel-name">{nowPlaying.channel.name}</div>
        </div>
        
        <div className="player-controls">
          <button onClick={audioState.isPlaying ? pause : play}>
            {audioState.isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <div className="progress-bar">
            <input
              type="range"
              min="0"
              max={audioState.duration}
              value={audioState.currentTime}
              onChange={(e) => seek(parseInt(e.target.value))}
            />
            <div className="time-display">
              {formatTime(audioState.currentTime)} / {formatTime(audioState.duration)}
            </div>
          </div>
          
          <div className="volume-control">
            <Volume2 size={20} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audioState.volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </div>
        </div>
        
        <div className="player-actions">
          <button onClick={handleLike} title="Like track">
            <Heart size={20} />
          </button>
          <button onClick={handleShare} title="Share">
            <Share size={20} />
          </button>
          
          {nowPlaying.track.affiliateLinks && (
            <div className="affiliate-links">
              {Object.entries(nowPlaying.track.affiliateLinks).map(([platform, url]) => (
                <button
                  key={platform}
                  onClick={() => handleAffiliateClick(platform, url)}
                  title={`Buy on ${platform}`}
                >
                  <Download size={16} />
                  {platform}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};