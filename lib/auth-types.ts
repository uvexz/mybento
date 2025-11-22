/**
 * Better Auth 扩展类型定义
 * 包含自定义字段的类型
 */

export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  // 自定义字段
  username: string;
  bio?: string | null;
  backgroundImage?: string | null;
  profileColor?: string | null;
  role?: string;
}

export interface ExtendedSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: ExtendedUser;
}
