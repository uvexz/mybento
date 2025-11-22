'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { validatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/lib/password';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const passwordStrength = validatePasswordStrength(password);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam === 'INVALID_TOKEN') {
            setError('Invalid or expired reset link. Please request a new one.');
        } else if (tokenParam) {
            setToken(tokenParam);
        } else {
            setError('No reset token provided.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Invalid reset token');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!passwordStrength.isValid) {
            setError('Password is too weak. ' + passwordStrength.feedback.join('. '));
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await authClient.resetPassword({
                newPassword: password,
                token,
            });

            if (error) {
                setError(error.message || 'Failed to reset password');
                setIsLoading(false);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Password Reset Successful! ✓</CardTitle>
                        <CardDescription className="text-center">
                            Your password has been reset successfully
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center space-y-4">
                            <div className="text-6xl">✓</div>
                            <p className="text-sm text-gray-600">
                                Redirecting you to login...
                            </p>
                        </div>
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
                    {!token || error ? (
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-800">{error || 'Invalid reset link'}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button asChild className="w-full">
                                    <Link href="/forgot-password">Request New Reset Link</Link>
                                </Button>
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="/login">Back to Login</Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
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
                                    disabled={isLoading}
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
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 text-center">{error}</p>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Resetting Password...' : 'Reset Password'}
                            </Button>
                        </form>
                    )}

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
