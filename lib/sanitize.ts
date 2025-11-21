// Input sanitization utilities for XSS protection

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags and encodes special characters
 */
export function sanitizeHtml(input: string): string {
    if (!input) return '';
    
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize user input for safe storage and display
 * Trims whitespace and limits length
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
    if (!input) return '';
    
    return input
        .trim()
        .slice(0, maxLength);
}

/**
 * Validate and sanitize URL
 * Only allows http, https, and mailto protocols
 */
export function sanitizeUrl(url: string): string | null {
    if (!url) return null;
    
    try {
        const parsed = new URL(url);
        const allowedProtocols = ['http:', 'https:', 'mailto:'];
        
        if (!allowedProtocols.includes(parsed.protocol)) {
            return null;
        }
        
        return parsed.toString();
    } catch {
        return null;
    }
}

/**
 * Sanitize username - only allow alphanumeric, underscore, and hyphen
 */
export function sanitizeUsername(username: string): string {
    if (!username) return '';
    
    return username
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '')
        .slice(0, 50);
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
    if (!email) return '';
    
    return email
        .toLowerCase()
        .trim()
        .slice(0, 255);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Remove potentially dangerous characters from file names
 */
export function sanitizeFileName(fileName: string): string {
    if (!fileName) return '';
    
    return fileName
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .slice(0, 255);
}
