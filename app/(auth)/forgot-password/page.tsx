'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [emailConfigured, setEmailConfigured] = useState(true);

    useEffect(() => {
        // 检查邮件服务是否配置
        fetch('/api/email-verification-status')
            .then(res => res.json())
            .then(data => {
                setEmailConfigured(data.enabled);
            })
            .catch(() => {
                setEmailConfigured(false);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!emailConfigured) {
            setMessage({ 
                type: 'error', 
                text: 'Password reset is not available. Email service is not configured.' 
            });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            // 直接调用 Better Auth 的 API 端点
            const response = await fetch('/api/auth/forget-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    redirectTo: `${window.location.origin}/reset-password`,
                }),
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                setMessage({ type: 'error', text: result.error || 'Failed to send reset email' });
            } else {
                setMessage({ 
                    type: 'success', 
                    text: 'If an account exists with this email, you will receive a password reset link.' 
                });
                setEmail('');
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Something went wrong' });
        }

        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to receive a password reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="mymail@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {message && (
                            <p className={`text-sm text-center ${
                                message.type === 'success' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {message.text}
                            </p>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm space-y-2">
                        <Link href="/login" className="underline block">
                            Back to Login
                        </Link>
                        <Link href="/register" className="underline block">
                            Create an account
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
