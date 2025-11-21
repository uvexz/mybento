'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        fetch('/api/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus('success');
                    setMessage('Email verified successfully! You can now login.');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Something went wrong');
            });
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
                    <CardDescription className="text-center">
                        {status === 'loading' && 'Verifying your email...'}
                        {status === 'success' && 'Verification successful'}
                        {status === 'error' && 'Verification failed'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    {status === 'loading' && (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    )}
                    
                    {status === 'success' && (
                        <div className="space-y-4">
                            <div className="text-green-600 text-4xl">✓</div>
                            <p className="text-sm text-gray-600">{message}</p>
                            <Button asChild className="w-full">
                                <Link href="/login">Go to Login</Link>
                            </Button>
                        </div>
                    )}
                    
                    {status === 'error' && (
                        <div className="space-y-4">
                            <div className="text-red-600 text-4xl">✗</div>
                            <p className="text-sm text-red-600">{message}</p>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/register">Back to Register</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardContent className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </CardContent>
                </Card>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
