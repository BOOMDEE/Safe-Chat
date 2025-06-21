"use client";

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Send, LogOut, UserCircle, Trash2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Message } from '@/lib/types';
import { MESSAGES_STORAGE_KEY, USER_ID_SESSION_KEY } from '@/lib/constants';
import { cn } from '@/lib/utils';

const MESSAGE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Screenshot prevention effect
  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    setIsWindowFocused(document.hasFocus());

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Auth check and initial load
  useEffect(() => {
    const userId = sessionStorage.getItem(USER_ID_SESSION_KEY);
    if (!userId) {
      router.replace('/');
      return;
    }
    setCurrentUser(userId);

    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (storedMessages) {
      const parsedMessages: Message[] = JSON.parse(storedMessages);
      const now = Date.now();
      const validMessages = parsedMessages.filter(
        (msg) => now - msg.timestamp < MESSAGE_EXPIRATION_MS
      );
      setMessages(validMessages);
      if (validMessages.length < parsedMessages.length) {
        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(validMessages));
      }
    }
  }, [router]);

  // Effect for real-time updates across tabs and message expiration
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === MESSAGES_STORAGE_KEY && event.newValue) {
        setMessages(JSON.parse(event.newValue));
      }
    };

    const intervalId = setInterval(() => {
      const now = Date.now();
      setMessages((prevMessages) => {
        const validMessages = prevMessages.filter(
          (msg) => now - msg.timestamp < MESSAGE_EXPIRATION_MS
        );
        if (validMessages.length < prevMessages.length) {
          localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(validMessages));
        }
        return validMessages;
      });
    }, 60 * 1000); // Check every minute

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const handleLogout = () => {
    sessionStorage.removeItem(USER_ID_SESSION_KEY);
    router.push('/');
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(MESSAGES_STORAGE_KEY);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;

    const message: Message = {
      id: `${Date.now()}-${currentUser}`,
      text: newMessage.trim(),
      sender: currentUser,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMessages));
    setNewMessage('');
  };

  if (!currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
           <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-muted-foreground">正在加载会话...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-muted/30 relative">
        <header className={cn("flex items-center justify-between border-b bg-background p-3 shadow-sm z-10 transition-all", { 'blur-sm pointer-events-none': !isWindowFocused })}>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary text-primary-foreground rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 6-2 5h4l-2 5"/><path d="M7 13v2a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4v-2"/><path d="M17 11V9a4 4 0 0 0-4-4h0a4 4 0 0 0-4 4v2"/></svg>
            </div>
            <h1 className="text-xl font-bold font-headline">Safe Chat</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCircle className="h-5 w-5" />
              <span>用户 {currentUser}</span>
            </div>
            
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                     <Button variant="ghost" size="icon" disabled={messages.length === 0}>
                        <Trash2 className="h-5 w-5" />
                     </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>清除聊天记录</p>
                </TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确定要清除聊天记录吗？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作将永久删除所有消息，且无法撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearChat} className={buttonVariants({ variant: "destructive" })}>
                    确认清除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>登出</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        <main className={cn("flex-1 overflow-hidden transition-all", { 'blur-sm pointer-events-none': !isWindowFocused })}>
          <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
            <div className="p-4 md:p-6 space-y-6">
              {messages.length === 0 ? (
                 <div className="text-center text-muted-foreground py-10">
                    <p>暂无消息。</p>
                    <p className="text-xs">开始聊天，或放心，消息将在一小时后自动消失。</p>
                 </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex items-end gap-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
                      msg.sender === currentUser ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.sender !== currentUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{msg.sender}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-xs md:max-w-md lg:max-w-lg rounded-xl p-3 shadow-md',
                        msg.sender === currentUser
                          ? 'rounded-br-none bg-primary text-primary-foreground'
                          : 'rounded-bl-none bg-card text-card-foreground'
                      )}
                    >
                      <p className="text-base whitespace-pre-wrap break-words">{msg.text}</p>
                      <p className={cn("mt-2 text-xs opacity-70 text-right", msg.sender === currentUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                        {format(new Date(msg.timestamp), 'p', { locale: zhCN })}
                      </p>
                    </div>
                    {msg.sender === currentUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-accent text-accent-foreground">{msg.sender}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </main>
        
        <footer className={cn("border-t bg-background p-4 transition-all", { 'blur-sm pointer-events-none': !isWindowFocused })}>
          <form className="flex items-start gap-2" onSubmit={handleSendMessage}>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="输入您的安全信息..."
              className="flex-1 resize-none bg-card"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90 h-10 w-10 shrink-0" disabled={!newMessage.trim()}>
              <Send className="h-5 w-5" />
              <span className="sr-only">发送消息</span>
            </Button>
          </form>
        </footer>

        {!isWindowFocused && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0">
            <ShieldAlert className="h-16 w-16 text-primary" />
            <h2 className="mt-4 text-2xl font-bold">会话已暂停</h2>
            <p className="mt-2 text-muted-foreground">为保护您的隐私，请返回此窗口以继续。</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
