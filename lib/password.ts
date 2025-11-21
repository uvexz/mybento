// Password strength validation utilities

export interface PasswordStrength {
    score: number; // 0-4
    feedback: string[];
    isValid: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    // Minimum length check
    if (password.length < 8) {
        feedback.push('Password must be at least 8 characters long');
        return { score: 0, feedback, isValid: false };
    }

    // Length scoring
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety checks
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (hasLowercase && hasUppercase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChars) score++;

    // Generate feedback
    if (!hasLowercase || !hasUppercase) {
        feedback.push('Use both uppercase and lowercase letters');
    }
    if (!hasNumbers) {
        feedback.push('Include at least one number');
    }
    if (!hasSpecialChars) {
        feedback.push('Include at least one special character (!@#$%^&*)');
    }

    // Common password patterns check
    const commonPatterns = ['password', '12345', 'qwerty', 'admin', 'letmein'];
    const lowerPassword = password.toLowerCase();
    if (commonPatterns.some(pattern => lowerPassword.includes(pattern))) {
        feedback.push('Avoid common password patterns');
        score = Math.max(0, score - 2);
    }

    const isValid = score >= 3 && feedback.length === 0;

    if (isValid) {
        feedback.push('Strong password!');
    }

    return { score: Math.min(4, score), feedback, isValid };
}

export function getPasswordStrengthLabel(score: number): string {
    switch (score) {
        case 0:
        case 1:
            return 'Weak';
        case 2:
            return 'Fair';
        case 3:
            return 'Good';
        case 4:
            return 'Strong';
        default:
            return 'Weak';
    }
}

export function getPasswordStrengthColor(score: number): string {
    switch (score) {
        case 0:
        case 1:
            return 'bg-red-500';
        case 2:
            return 'bg-yellow-500';
        case 3:
            return 'bg-blue-500';
        case 4:
            return 'bg-green-500';
        default:
            return 'bg-gray-300';
    }
}
