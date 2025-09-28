import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface WebSocketContextType {
  isConnected: boolean;
  listenerCounts: { [channelId: string]: number };
  messages: WebSocketMessage[];
  sendMessage: (channelId: string, message: WebSocketMessage) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [listenerCounts, setListenerCounts] = useState<{ [channelId: string]: number }>({});
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = (channelId?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = channelId 
        ? `${protocol}//${window.location.host}/ws/${channelId}`
        : `${protocol}//${window.location.host}/ws/global`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        
        // Attempt reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect(channelId);
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    setMessages(prev => [...prev.slice(-99), message]); // Keep last 100 messages

    switch (message.type) {
      case 'listener_count':
        setListenerCounts(prev => ({
          ...prev,
          [message.channel_id]: message.count
        }));
        break;
      
      case 'user_message':
        // Handle user messages (dedications, etc.)
        console.log('User message:', message);
        break;
      
      case 'now_playing':
        // Handle now playing updates
        console.log('Now playing update:', message);
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const sendMessage = (channelId: string, message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  };

  useEffect(() => {
    // Connect to global WebSocket for initial data
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{
      isConnected,
      listenerCounts,
      messages,
      sendMessage
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};