'use client';

import { useActionState, useState } from 'react';
import { register } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { validatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/lib/password';

export default function RegisterPage() {
    const [password, setPassword] = useState('');
    const passwordStrength = validatePasswordStrength(password);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [state, formAction, isPending] = useActionState(async (_prev: any, formData: FormData) => {
        return await register(formData);
    }, null);

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
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" placeholder="johndoe" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
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

                        {state?.error && (
                            <p className="text-sm text-red-500 text-center">{state.error}</p>
                        )}
                        {state?.success && (
                            <div className="text-center">
                                <p className="text-sm text-green-500 mb-2">{state.success}</p>
                                <Button asChild className="w-full">
                                    <Link href="/login">Go to Login</Link>
                                </Button>
                            </div>
                        )}

                        {!state?.success && (
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? 'Creating account...' : 'Register'}
                            </Button>
                        )}
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
