
export const RESTRICTED_USERNAMES = [
    'admin',
    'administrator',
    'login',
    'logout',
    'log',
    'register',
    'reg',
    'signup',
    'signin',
    'sign-in',
    'sign-up',
    'sign',
    'user',
    'username',
    'users',
    'api',
    'dashboard',
    'dash',
    'panel',
    'settings',
    'setting',
    'set',
    'pricing',
    'about',
    'contact',
    'contacts',
    '404',
    'static',
    'sratics',
    'assets',
    'asset',
    'bento',
    'mybento',
    'card',
];

export function validateUsername(username: string): { valid: boolean; error?: string } {
    if (!username) {
        return { valid: false, error: 'Username is required' };
    }

    const lowerUsername = username.toLowerCase();

    // Check length (must be at least 3 characters)
    if (username.length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters long' };
    }

    // Check restricted names
    if (RESTRICTED_USERNAMES.includes(lowerUsername)) {
        return { valid: false, error: 'This username is reserved' };
    }

    // Check for valid characters (alphanumeric, underscores, hyphens)
    // This is a common requirement, though not explicitly asked, it's good practice.
    // The user asked for "Single characters, double characters" restriction which implies length check.
    // I will stick to the requested restrictions first.

    // "Single characters, double characters" are covered by length < 3 check.

    // Check if it looks like a file extension or path (optional but good for "static", "assets" etc)
    // The list covers specific names.

    return { valid: true };
}
