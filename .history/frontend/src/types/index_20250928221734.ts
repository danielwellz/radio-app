// Core application types

export interface Channel {
  id: string;
  name: string;
  description: string;
  genre: string;
  current_listeners: number;
  is_live: boolean;
  image_url: string;
  color: string;
  stream_url?: string;
  schedule?: Record<string, string[]>;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover_art: string;
  affiliate_links: Record<string, string>;
  play_count: number;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  host: string;
  channel_id: string;
  schedule: string;
  image_url: string;
  next_airtime: string;
}

export interface NowPlaying {
  track: Track;
  channel: Channel;
  progress: number;
  duration: number;
  is_ad: boolean;
}

export interface UserMessage {
  user_id: string;
  channel_id: string;
  type: 'dedication' | 'message' | 'shoutout';
  content: string;
  timestamp: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'listener_count' | 'now_playing' | 'user_message' | 'track_like' | 'ping' | 'pong';
  [key: string]: any;
}

// Audio context types
export interface AudioState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  quality: 'low' | 'medium' | 'high';
  isLive: boolean;
  playbackRate: number;
}