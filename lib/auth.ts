import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { sendVerificationEmail, isEmailConfigured } from "./email";

// 检查是否配置了邮件服务
const emailConfigured = isEmailConfigured();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: !emailConfigured, // 如果配置了邮件，则不自动登录（需要验证邮箱）
    requireEmailVerification: emailConfigured, // 如果配置了邮件，则要求验证邮箱
    sendResetPassword: emailConfigured ? async ({ user, url }) => {
      const { sendPasswordResetEmail } = await import("./email");
      await sendPasswordResetEmail({
        to: user.email,
        username: user.name || user.email.split('@')[0],
        resetUrl: url,
      });
    } : undefined,
  },
  // 邮箱验证配置（仅在配置了 RESEND_API_KEY 时启用）
  ...(emailConfigured && {
    emailVerification: {
      sendOnSignUp: true, // 注册时自动发送验证邮件
      autoSignInAfterVerification: true, // 验证后自动登录
      expiresIn: 3600, // 验证链接 1 小时后过期
      sendVerificationEmail: async ({ user, url }) => {
        await sendVerificationEmail({
          to: user.email,
          username: user.name || user.email.split('@')[0],
          verificationUrl: url,
        });
      },
    },
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
        unique: true,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        input: false,
      },
      image: {
        type: "string",
        required: false,
        input: false,
      },
      backgroundImage: {
        type: "string",
        required: false,
        input: false,
      },
      profileColor: {
        type: "string",
        required: false,
        input: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
} as const);

// 导出类型
export type { ExtendedUser, ExtendedSession } from "./auth-types";
