'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { authClient, type ExtendedUser } from '@/lib/auth-client';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showResendVerification, setShowResendVerification] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 使用客户端 authClient 来登录，这样会正确设置 cookie
            const { data, error } = await authClient.signIn.email(
                {
                    email,
                    password,
                },
                {
                    onError: (ctx) => {
                        // 处理不同类型的错误
                        if (ctx.error.status === 403) {
                            // 邮箱未验证
                            setError('Please verify your email address before logging in. Check your inbox for the verification link.');
                            setShowResendVerification(true);
                        } else if (ctx.error.status === 401) {
                            // 认证失败（密码错误或用户不存在）
                            setError('Invalid email or password. Please check your credentials and try again.');
                            setShowResendVerification(false);
                        } else {
                            // 其他错误
                            setError(ctx.error.message || 'Login failed. Please try again.');
                            setShowResendVerification(false);
                        }
                        setIsLoading(false);
                    },
                }
            );

            if (error) {
                // 如果 onError 没有触发，手动处理错误
                if (error.status === 403) {
                    setError('Please verify your email address before logging in. Check your inbox for the verification link.');
                    setShowResendVerification(true);
                } else if (error.status === 401) {
                    setError('Invalid email or password. Please check your credentials and try again.');
                    setShowResendVerification(false);
                } else {
                    setError(error.message || 'Login failed. Please try again.');
                    setShowResendVerification(false);
                }
                setIsLoading(false);
            } else if (data?.user) {
                // 登录成功，使用完整页面刷新确保所有状态更新
                const user = data.user as ExtendedUser;
                const username = user.username;
                if (username) {
                    window.location.href = `/${username}`;
                } else {
                    window.location.href = '/';
                }
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendSuccess(false);
        setIsLoading(true);
        
        try {
            await authClient.sendVerificationEmail({
                email,
                callbackURL: '/',
            });
            setResendSuccess(true);
            setError('');
        } catch (err: any) {
            setError('Failed to resend verification email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center">
                        Login to manage your bento
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
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                name="password" 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="space-y-2">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <svg 
                                            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                            />
                                        </svg>
                                        <p className="text-sm text-red-800 flex-1">{error}</p>
                                    </div>
                                </div>
                                {showResendVerification && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={handleResendVerification}
                                        disabled={isLoading}
                                    >
                                        Resend Verification Email
                                    </Button>
                                )}
                            </div>
                        )}

                        {resendSuccess && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <svg 
                                        className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                                        />
                                    </svg>
                                    <p className="text-sm text-green-800 flex-1">
                                        Verification email sent! Please check your inbox.
                                    </p>
                                </div>
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm space-y-2">
                        <div>
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="underline">
                                Register
                            </Link>
                        </div>
                        <div>
                            <Link href="/forgot-password" className="underline text-gray-600">
                                Forgot password?
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
