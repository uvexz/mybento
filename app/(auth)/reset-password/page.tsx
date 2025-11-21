'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { resetPassword } from '@/lib/actions';
import { validatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/lib/password';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const passwordStrength = validatePasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (!token) {
            setMessage({ type: 'error', text: 'Invalid reset link' });
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            setIsLoading(false);
            return;
        }

        const result = await resetPassword(token, password);

        if (result.success) {
            setMessage({ type: 'success', text: result.success });
            setPassword('');
            setConfirmPassword('');
        } else {
            setMessage({ type: 'error', text: result.error || 'Something went wrong' });
        }

        setIsLoading(false);
    };

    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Invalid Link</CardTitle>
                        <CardDescription className="text-center">
                            This password reset link is invalid
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button asChild className="w-full">
                            <Link href="/forgot-password">Request New Link</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your new password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                                                style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">
                                            {getPasswordStrengthLabel(passwordStrength.score)}
                                        </span>
                                    </div>

                                    {passwordStrength.feedback.length > 0 && (
                                        <ul className="text-xs text-gray-600 space-y-1">
                                            {passwordStrength.feedback.map((msg, i) => (
                                                <li key={i} className={passwordStrength.isValid ? 'text-green-600' : ''}>
                                                    {passwordStrength.isValid ? '✓' : '•'} {msg}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {message && (
                            <div className="text-center">
                                <p className={`text-sm ${
                                    message.type === 'success' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {message.text}
                                </p>
                                {message.type === 'success' && (
                                    <Button asChild className="w-full mt-4">
                                        <Link href="/login">Go to Login</Link>
                                    </Button>
                                )}
                            </div>
                        )}

                        {message?.type !== 'success' && (
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        )}
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <Link href="/login" className="underline">
                            Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
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
            <ResetPasswordForm />
        </Suspense>
    );
}
