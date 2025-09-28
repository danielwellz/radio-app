import React from 'react';
import { AudioProvider } from '../../contexts/AudioContext';
import { WebSocketProvider } from '../../contexts/WebSocketContext';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <WebSocketProvider>
      <AudioProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col relative">
          {children}
        </div>
      </AudioProvider>
    </WebSocketProvider>
  );
};