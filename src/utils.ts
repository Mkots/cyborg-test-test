// Utility functions for demonstration
export class Calculator {
    add(a: number, b: number): number {
        return a + b;
    }

    subtract(a: number, b: number): number {
        return a - b;
    }

    multiply(a: number, b: number): number {
        return a * b;
    }

    divide(a: number, b: number): number {
        if (b === 0) {
            throw new Error('Division by zero');
        }
        return a / b;
    }

    power(base: number, exponent: number): number {
        return Math.pow(base, exponent);
    }
}

export class StringHelper {
    static capitalize(str: string): string {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static reverse(str: string): string {
        return str.split('').reverse().join('');
    }

    static isPalindrome(str: string): boolean {
        const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleaned === cleaned.split('').reverse().join('');
    }

    static truncate(str: string, maxLength: number): string {
        if (str.length <= maxLength) return str;
        return str.slice(0, maxLength - 3) + '...';
    }
}

export class ArrayHelper {
    static unique<T>(arr: T[]): T[] {
        // @ts-ignore
        return [...new Set(arr)];
    }

    static chunk<T>(arr: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    }

    static flatten<T>(arr: (T | T[])[]): T[] {
        return arr.reduce((flat, item) => {
            // @ts-ignore-next-line
            return flat.concat(Array.isArray(item) ? item : [item]);
        }, [] as T[]);
    }

    static sum(arr: number[]): number {
        return arr.reduce((acc, val) => acc + val, 0);
    }

    static average(arr: number[]): number {
        if (arr.length === 0) return 0;
        return this.sum(arr) / arr.length;
    }
}

export class AsyncHelper {
    static async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async fetchUser(id: number): Promise<{ id: number; name: string }> {
        await this.delay(100);
        if (id <= 0) {
            throw new Error('Invalid user ID');
        }
        return { id, name: `User ${id}` };
    }

    static async retryOperation<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3
    ): Promise<T> {
        let lastError: Error;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;
                if (i < maxRetries - 1) {
                    await this.delay(100 * (i + 1));
                }
            }
        }
        throw lastError!;
    }
}

export class Validator {
    static isEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isStrongPassword(password: string): boolean {
        if (password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[a-z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        if (!/[!@#$%^&*]/.test(password)) return false;
        return true;
    }

    static isURL(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}