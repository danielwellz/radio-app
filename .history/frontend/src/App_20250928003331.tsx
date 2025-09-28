// frontend/src/App.tsx - COMPLETELY REDESIGNED
import React, { useState, useEffect } from 'react';
import { AudioPlayer } from './components/AudioPlayer';
import { ChannelGrid } from './components/ChannelGrid';
// import { NowPlayingSheet } from './components/NowPlayingSheet';
// import { BottomNavigation } from './components/BottomNavigation';
// import { ProgramsView } from './components/ProgramsView';
// import { UserProfile } from './components/UserProfile';
import { AudioProvider } from './contexts/AudioContext';
// import { WebSocketProvider } from './contexts/WebSocketContext';
import { Radio, Search, Heart, User, Calendar } from 'lucide-react';

type View = 'channels' | 'programs' | 'favorites' | 'profile';

function App() {
  const [currentView, setCurrentView] = useState<View>('channels');
  const [searchQuery, setSearchQuery] = useState('');

  const renderContent = () => {
    switch (currentView) {
      case 'channels':
        return <ChannelGrid searchQuery={searchQuery} />;
      case 'programs':
        // return <ProgramsView />;
      case 'favorites':
        return <div className="p-4 text-center text-muted-foreground">Favorites coming soon</div>;
      case 'profile':
        // return <UserProfile />;
      default:
        return <ChannelGrid searchQuery={searchQuery} />;
    }
  };

  return (
    <WebSocketProvider>
      <AudioProvider>
        <div className="min-h-screen bg-background text-foreground relative">
          {/* Header */}
          <header className="sticky top-0 z-40 glass border-b border-border">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Radio className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-xl font-bold gradient-text">WaveRadio</h1>
                </div>
                
                {currentView === 'channels' && (
                  <div className="relative flex-1 max-w-md ml-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search channels..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="pb-24"> {/* Extra padding for bottom navigation and audio player */}
            {renderContent()}
          </main>

          {/* Bottom Navigation */}
          <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />

          {/* Audio Player */}
          <AudioPlayer />

          {/* Now Playing Sheet */}
          <NowPlayingSheet />
        </div>
      </AudioProvider>
    </WebSocketProvider>
  );
}

export default App;