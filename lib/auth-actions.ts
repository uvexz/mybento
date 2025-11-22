'use server';

import { auth, type ExtendedSession } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * 获取当前会话（服务器端）- 带类型安全
 */
export async function getSession(): Promise<ExtendedSession | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session as ExtendedSession | null;
}

/**
 * 登出（服务器端）
 * 注意：这个方法不会清除客户端 cookie，建议使用客户端的 authClient.signOut()
 */
export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers()
    });
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: 'Failed to sign out' };
  }
}
