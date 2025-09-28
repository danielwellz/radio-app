import React, { useState } from 'react';
import { User, Bell, Moon, Volume2, Download, Shield, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { usePushNotifications } from '../hooks/usePushNotifications';

export const UserProfile: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [volume, setVolume] = useState(80);
  
  const { 
    isSupported: pushSupported, 
    permission, 
    requestPermission,
    subscribe,
    unsubscribe 
  } = usePushNotifications();

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      // Enable notifications
      if (permission === 'default') {
        const granted = await requestPermission();
        if (granted) {
          await subscribe();
        }
      } else if (permission === 'granted') {
        await subscribe();
      }
    } else {
      // Disable notifications
      await unsubscribe();
    }
    setNotificationsEnabled(!notificationsEnabled);
  };

  const settings = [
    {
      icon: Bell,
      label: 'Push Notifications',
      description: 'Get notified about new shows and events',
      action: (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {pushSupported ? (notificationsEnabled ? 'On' : 'Off') : 'Not supported'}
          </span>
          <button
            onClick={handleNotificationToggle}
            className={`w-12 h-6 rounded-full transition-colors ${
              notificationsEnabled ? 'bg-primary' : 'bg-muted'
            } relative`}
            disabled={!pushSupported}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
              notificationsEnabled ? 'transform translate-x-7' : 'transform translate-x-1'
            }`} />
          </button>
        </div>
      )
    },
    {
      icon: Moon,
      label: 'Dark Mode',
      description: 'Switch between light and dark theme',
      action: (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{darkMode ? 'On' : 'Off'}</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full transition-colors ${
              darkMode ? 'bg-primary' : 'bg-muted'
            } relative`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
              darkMode ? 'transform translate-x-7' : 'transform translate-x-1'
            }`} />
          </button>
        </div>
      )
    },
    {
      icon: Volume2,
      label: 'Volume',
      description: 'Adjust default volume level',
      action: (
        <div className="flex items-center gap-3 w-32">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <span className="text-sm text-muted-foreground w-8">{volume}%</span>
        </div>
      )
    }
  ];

  const actions = [
    {
      icon: Download,
      label: 'Offline Listening',
      description: 'Download content for offline playback'
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      description: 'Manage your data and privacy settings'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help with the app'
    }
  ];

  return (
    <div className="p-4">
      {/* User Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">Listener</h2>
              <p className="text-muted-foreground">Welcome to WaveRadio</p>
            </div>
            <Button variant="outline">Sign In</Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Preferences</h3>
        <div className="space-y-3">
          {settings.map((setting, index) => (
            <Card key={index} hover>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <setting.icon size={20} className="text-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{setting.label}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                    </div>
                  </div>
                  {setting.action}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">More</h3>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Card key={index} hover>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <action.icon size={20} className="text-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-sm text-muted-foreground">{action.description}</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};