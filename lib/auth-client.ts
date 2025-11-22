import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;

// 导出类型
export type { ExtendedUser, ExtendedSession } from "./auth-types";
