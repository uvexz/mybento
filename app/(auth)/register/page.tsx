'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { validatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/lib/password';
import { authClient, type ExtendedUser } from '@/lib/auth-client';
import { validateUsername } from '@/lib/username-validation';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
    const [registrationClosed, setRegistrationClosed] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const passwordStrength = validatePasswordStrength(password);

    useEffect(() => {
        // 检查注册是否开放
        fetch('/api/registration-status')
            .then(res => res.json())
            .then(data => {
                setRegistrationClosed(!data.isOpen);
                setCheckingStatus(false);
            })
            .catch(() => {
                setCheckingStatus(false);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        // 检查密码强度
        if (!passwordStrength.isValid) {
            setError('Password is too weak. ' + passwordStrength.feedback.join('. '));
            setIsLoading(false);
            return;
        }

        // 验证用户名
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            setError(usernameValidation.error || 'Invalid username');
            setIsLoading(false);
            return;
        }

        try {
            // 使用自定义注册端点（会检查注册是否开放）
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    username,
                    name: username,
                }),
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                setError(result.error || 'Registration failed');
                setIsLoading(false);
            } else {
                // 检查是否需要邮箱验证
                const requiresVerification = result.requiresVerification;

                if (requiresVerification) {
                    // 需要邮箱验证
                    setSuccess('Account created! Please check your email to verify your account.');
                    setIsLoading(false);
                    // 不自动登录，等待用户验证邮箱
                } else {
                    // 不需要邮箱验证，直接登录
                    const { data, error } = await authClient.signIn.email({
                        email,
                        password,
                    });

                    if (error) {
                        setError('Registration successful but login failed. Please try logging in manually.');
                        setIsLoading(false);
                    } else if (data?.user) {
                        setSuccess('Account created successfully! Redirecting...');
                        setTimeout(() => {
                            const user = data.user as ExtendedUser;
                            const userUsername = user.username;
                            if (userUsername) {
                                window.location.href = `/${userUsername}`;
                            } else {
                                window.location.href = '/';
                            }
                        }, 1000);
                    }
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            setIsLoading(false);
        }
    };

    if (checkingStatus) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardContent className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (registrationClosed) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Registration Closed</CardTitle>
                        <CardDescription className="text-center">
                            This site is in single-user mode and registration is currently closed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-600">
                                If you already have an account, you can log in below.
                            </p>
                            <Button asChild className="w-full">
                                <Link href="/login">Go to Login</Link>
                            </Button>
                            <div className="pt-4">
                                <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 underline">
                                    Back to Home
                                </Link>
                            </div>
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
                    <CardTitle className="text-2xl text-center">Create an account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your details to get started with mybento
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isLoading || !!success}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading || !!success}
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
                                disabled={isLoading || !!success}
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

                        {error && (
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
                        )}
                        {success && (
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
                                    <p className="text-sm text-green-800 flex-1">{success}</p>
                                </div>
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading || !!success}>
                            {isLoading ? 'Creating account...' : 'Register'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="underline">
                            Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
