import React, { useState, useEffect } from 'react';
import { MiniPlayer } from './components/Player/MiniPlayer';
import { FullScreenPlayer } from './components/Player/FullScreenPlayer';
import { ChannelList } from './components/Channel/ChannelList';
import { ProgramsView } from './components/ProgramsView';
import { UserProfile } from './components/UserProfile';
import { BottomNavigation } from './components/Layout/BottomNavigation';
import { AppShell } from './components/Layout/AppShell';
import { useAudio } from './contexts/AudioContext';
import { usePushNotifications } from './hooks/usePushNotifications';
import { Radio, Search, Heart, User, Calendar } from 'lucide-react';

type View = 'channels' | 'programs' | 'favorites' | 'profile' | 'search';

function App() {
  const [currentView, setCurrentView] = useState<View>('channels');
  const [searchQuery, setSearchQuery] = useState('');
  const { isPlayerExpanded } = useAudio();
  const { isSupported: pushSupported, permission, requestPermission } = usePushNotifications();

  // Request notification permission on app start
  useEffect(() => {
    if (pushSupported && permission === 'default') {
      // Don't request immediately - wait for user interaction
      console.log('Push notifications supported - permission will be requested when needed');
    }
  }, [pushSupported, permission]);

  const renderContent = () => {
    switch (currentView) {
      case 'channels':
        return <ChannelList searchQuery={searchQuery} />;
      case 'programs':
        return <ProgramsView />;
      case 'favorites':
        return (
          <div className="p-4 text-center">
            <Heart size={48} className="text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground">Your favorite channels will appear here</div>
          </div>
        );
      case 'profile':
        return <UserProfile />;
      case 'search':
        return (
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search channels, shows, or tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <ChannelList searchQuery={searchQuery} />
          </div>
        );
      default:
        return <ChannelList searchQuery={searchQuery} />;
    }
  };

  return (
    <AppShell>
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
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />

      {/* Audio Player */}
      {isPlayerExpanded ? <FullScreenPlayer /> : <MiniPlayer />}
    </AppShell>
  );
}

export default App;