import React from 'react';
import { Radio, Calendar, Heart, User } from 'lucide-react';

type View = 'channels' | 'programs' | 'favorites' | 'profile';

interface BottomNavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'channels' as View, icon: Radio, label: 'Channels' },
    { id: 'programs' as View, icon: Calendar, label: 'Programs' },
    { id: 'favorites' as View, icon: Heart, label: 'Favorites' },
    { id: 'profile' as View, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border pb-safe">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};