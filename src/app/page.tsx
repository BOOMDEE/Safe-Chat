"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PIN_USER_MAP, MESSAGES_STORAGE_KEY, USER_ID_SESSION_KEY } from '@/lib/constants';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setPin(value);
    }
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;

    setIsLoading(true);

    // Simulate network delay for effect
    setTimeout(() => {
      const userId = PIN_USER_MAP[pin];
      if (userId) {
        sessionStorage.setItem(USER_ID_SESSION_KEY, userId);
        router.push('/chat');
      } else {
        localStorage.removeItem(MESSAGES_STORAGE_KEY);
        toast({
          variant: "destructive",
          title: "PIN Invalid",
          description: "All message history has been cleared for security.",
        });
        setPin('');
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl border-2 border-transparent focus-within:border-primary transition-colors duration-300">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">CipherChat</CardTitle>
          <CardDescription>Enter your PIN to begin a secure session.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={handlePinChange}
                maxLength={4}
                placeholder="••••"
                className="text-center text-4xl tracking-[0.5em] font-mono h-16"
                autoComplete="off"
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading || pin.length !== 4}>
              {isLoading ? 'Verifying...' : 'Unlock'}
              <Lock className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-xs text-muted-foreground text-center">A failed attempt will erase all message history.</p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
