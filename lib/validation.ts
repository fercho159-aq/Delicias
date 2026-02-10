// Simple validation helpers — no external dependencies

export function sanitizeString(input: unknown): string {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/<[^>]*>/g, ''); // Strip HTML tags
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
    return /^[\d\s\-\+\(\)]{7,20}$/.test(phone);
}

export function isValidZipCode(zip: string): boolean {
    return /^\d{4,6}$/.test(zip);
}

export function isPositiveNumber(value: unknown): boolean {
    return typeof value === 'number' && value > 0 && isFinite(value);
}

export function isPositiveInteger(value: unknown): boolean {
    return typeof value === 'number' && Number.isInteger(value) && value > 0;
}
