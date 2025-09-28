import React from 'react';
import { Radio, Calendar, Heart, User, Search } from 'lucide-react';

type View = 'channels' | 'programs' | 'favorites' | 'profile' | 'search';

interface BottomNavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentView, 
  onViewChange 
}) => {
  const navItems = [
    { id: 'channels' as View, icon: Radio, label: 'Channels' },
    { id: 'search' as View, icon: Search, label: 'Search' },
    { id: 'programs' as View, icon: Calendar, label: 'Programs' },
    { id: 'favorites' as View, icon: Heart, label: 'Favorites' },
    { id: 'profile' as View, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border pb-safe z-40">
      <div className="flex justify-around items-center py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px] ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon 
                size={20} 
                className={isActive ? 'scale-110' : ''}
              />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="w-1 h-1 bg-primary rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};