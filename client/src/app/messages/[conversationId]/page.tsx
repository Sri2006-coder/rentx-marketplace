'use client';

import { useState, useEffect, useRef, use } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { socket } from '@/lib/socket';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function ChatRoomPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const unwrappedParams = use(params);
  const conversationId = unwrappedParams.conversationId;
  const { user } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/conversations/${conversationId}/messages`);
        setMessages(res.data.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Connect to Socket
    socket.connect();
    socket.emit('join_room', conversationId);

    const handleReceiveMessage = (message: any) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.disconnect();
    };
  }, [user, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage(''); // optimistic clear

    socket.emit('send_message', {
      conversationId,
      content,
    });
  };

  if (!user) return <div className="p-8 text-center text-white">Please log in to view chat.</div>;
  if (loading) return <div className="p-8 text-center text-white/50 animate-pulse">Loading chat...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 h-[85vh] flex flex-col">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/messages')}
        className="self-start mb-4 text-white hover:bg-white/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inbox
      </Button>

      <Card className="flex-1 bg-white/5 border-white/10 backdrop-blur-xl flex flex-col overflow-hidden">
        <CardHeader className="border-b border-white/10 bg-white/5 py-4">
          <h2 className="text-lg font-semibold text-white">Conversation</h2>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
          {messages.map((msg, index) => {
            const isMe = msg.senderId === user.id;
            return (
              <div 
                key={msg.id || index} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    isMe 
                      ? 'bg-primary-600 text-white rounded-br-sm' 
                      : 'bg-white/10 text-white rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[10px] text-white/40 mt-1 px-1">
                  {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : 'Just now'}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t border-white/10 bg-white/5">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-black/20 border-white/10 text-white focus:border-primary-500"
              maxLength={1000}
            />
            <Button type="submit" disabled={!newMessage.trim()} className="bg-primary-600 hover:bg-primary-700">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
