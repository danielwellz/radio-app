import React from 'react';
import { Calendar, Clock, Users } from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/Card';

export const ProgramsView: React.FC = () => {
  const programs = [
    {
      id: '1',
      title: 'Morning Chill',
      description: 'Start your day with relaxing lo-fi beats',
      host: 'DJ Chill',
      channel: 'Chill Lo-Fi',
      schedule: 'Mon-Fri 06:00-10:00',
      nextAirtime: '2024-01-15T06:00:00Z',
      listeners: 1242,
      imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'Deep Work Sessions',
      description: 'Focus-enhancing electronic music',
      host: 'Focus Master',
      channel: 'Deep Focus',
      schedule: 'Tue-Thu 08:00-12:00',
      nextAirtime: '2024-01-15T08:00:00Z',
      listeners: 876,
      imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=200&fit=crop'
    }
  ];

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Program Schedule</h1>
        <p className="text-muted-foreground">Upcoming shows and programs</p>
      </div>

      <div className="space-y-4">
        {programs.map(program => (
          <Card key={program.id} hover>
            <CardContent className="p-0">
              <div className="flex">
                <div className="w-24 h-24 flex-shrink-0">
                  <img
                    src={program.imageUrl}
                    alt={program.title}
                    className="w-full h-full object-cover rounded-l-2xl"
                  />
                </div>
                
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{program.title}</h3>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {program.channel}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3">{program.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{program.schedule}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Next: {formatTime(program.nextAirtime)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{program.listeners} listeners</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-foreground">Host: {program.host}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={48} className="text-muted-foreground mx-auto mb-4" />
          <div className="text-muted-foreground">No upcoming programs scheduled</div>
        </div>
      )}
    </div>
  );
};