// frontend/src/App.tsx
import React from 'react'
import { AudioPlayer } from './components/AudioPlayer'
import { ChannelGrid } from './components/ChannelGrid'
import { AudioProvider } from './contexts/AudioContext'

function App() {
  return (
    <AudioProvider>
      <div className="min-h-screen bg-gray-900">
        <header className="bg-gray-800 text-white p-4">
          <h1 className="text-2xl font-bold">Web Radio</h1>
          <p className="text-gray-400">Listen to your favorite channels</p>
        </header>
        
        <main className="pb-32"> {/* Padding for fixed audio player */}
          <ChannelGrid />
        </main>
        
        <AudioPlayer />
      </div>
    </AudioProvider>
  )
}

export default App