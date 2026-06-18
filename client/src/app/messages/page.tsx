'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/chat/conversations');
        setConversations(res.data.data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user]);

  if (!user) return <div className="p-8 text-center text-white">Please log in to view messages.</div>;
  if (loading) return <div className="p-8 text-center text-white/50 animate-pulse">Loading messages...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 min-h-[80vh]">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
        <MessageSquare className="w-8 h-8 mr-3 text-primary-500" />
        Messages
      </h1>

      {conversations.length === 0 ? (
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardContent className="p-12 text-center text-white/60">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No messages yet.</p>
            <p className="text-sm mt-2">When you contact an owner or renter, your conversations will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => {
            const isOwner = user.id === conv.ownerId;
            const otherUser = isOwner ? conv.renter : conv.owner;
            const lastMessage = conv.messages[0];

            return (
              <Card 
                key={conv.id} 
                className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors cursor-pointer group"
                onClick={() => router.push(`/messages/${conv.id}`)}
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold text-lg">
                      {otherUser?.firstName?.charAt(0)}{otherUser?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {otherUser?.firstName} {otherUser?.lastName}
                      </h3>
                      {conv.item && (
                        <p className="text-xs text-white/40 mb-1">Regarding: {conv.item.title}</p>
                      )}
                      <p className="text-sm text-white/60 truncate max-w-md">
                        {lastMessage ? (
                          <span className={lastMessage.senderId !== user.id && !lastMessage.isRead ? 'text-white font-medium' : ''}>
                            {lastMessage.senderId === user.id ? 'You: ' : ''}{lastMessage.content}
                          </span>
                        ) : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {lastMessage && (
                      <span className="text-xs text-white/40">
                        {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                      </span>
                    )}
                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-primary-500 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
