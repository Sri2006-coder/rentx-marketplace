'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await register({ firstName, lastName, email, password });
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-12">
      <div className="absolute inset-0 z-[-1] bg-background/80" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl z-[-1]" />
      
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl shadow-primary/5">
        <CardHeader className="space-y-3 text-center flex flex-col items-center">
          <div className="bg-primary/20 p-3 rounded-2xl mb-2">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Join RentX to start renting and lending gear
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input 
                  id="firstName" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John" 
                  required
                  className="bg-black/20 border-white/10 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input 
                  id="lastName" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe" 
                  required
                  className="bg-black/20 border-white/10 focus-visible:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@gmail.com" 
                pattern="^[a-z0-9.]+@gmail\.com$"
                title="Please enter a valid @gmail.com address (lowercase letters, numbers, and periods only)"
                required
                className="bg-black/20 border-white/10 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="bg-black/20 border-white/10 focus-visible:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
