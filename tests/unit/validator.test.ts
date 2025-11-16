import { test, expect } from '@playwright/test';

import { Validator } from '../../src/utils';

test.describe('Validator', () => {
    test.describe('isEmail', () => {
        test('should validate correct email addresses', () => {
            expect(Validator.isEmail('test@example.com')).toBe(true);
            expect(Validator.isEmail('user.name@example.com')).toBe(true);
            expect(Validator.isEmail('user+tag@example.co.uk')).toBe(true);
            expect(Validator.isEmail('test_123@example-site.org')).toBe(true);
        });

        test('should reject invalid email addresses', () => {
            expect(Validator.isEmail('invalid')).toBe(false);
            expect(Validator.isEmail('invalid@')).toBe(false);
            expect(Validator.isEmail('@example.com')).toBe(false);
            expect(Validator.isEmail('test@')).toBe(false);
            expect(Validator.isEmail('test @example.com')).toBe(false);
        });

        test('should reject emails without domain', () => {
            expect(Validator.isEmail('test@domain')).toBe(false);
            expect(Validator.isEmail('test@.com')).toBe(false);
        });

        test('should reject emails with multiple @', () => {
            expect(Validator.isEmail('test@@example.com')).toBe(false);
            expect(Validator.isEmail('test@test@example.com')).toBe(false);
        });

        test('should handle edge cases', () => {
            expect(Validator.isEmail('')).toBe(false);
            expect(Validator.isEmail('   ')).toBe(false);
            expect(Validator.isEmail('test')).toBe(false);
        });

        test('should validate emails with numbers', () => {
            expect(Validator.isEmail('user123@example.com')).toBe(true);
            expect(Validator.isEmail('123@456.com')).toBe(true);
        });

        test('should validate emails with subdomain', () => {
            expect(Validator.isEmail('test@mail.example.com')).toBe(true);
            expect(Validator.isEmail('test@a.b.c.example.com')).toBe(true);
        });
    });

    test.describe('isStrongPassword', () => {
        test('should validate strong passwords', () => {
            expect(Validator.isStrongPassword('Passw0rd!')).toBe(true);
            expect(Validator.isStrongPassword('MyP@ssw0rd123')).toBe(true);
            expect(Validator.isStrongPassword('C0mpl3x!Pass')).toBe(true);
        });

        test('should reject passwords without uppercase', () => {
            expect(Validator.isStrongPassword('passw0rd!')).toBe(false);
            expect(Validator.isStrongPassword('myp@ssw0rd')).toBe(false);
        });

        test('should reject passwords without lowercase', () => {
            expect(Validator.isStrongPassword('PASSW0RD!')).toBe(false);
            expect(Validator.isStrongPassword('MYP@SSW0RD')).toBe(false);
        });

        test('should reject passwords without numbers', () => {
            expect(Validator.isStrongPassword('Password!')).toBe(false);
            expect(Validator.isStrongPassword('MyP@ssword')).toBe(false);
        });

        test('should reject passwords without special characters', () => {
            expect(Validator.isStrongPassword('Passw0rd')).toBe(false);
            expect(Validator.isStrongPassword('MyPassw0rd')).toBe(false);
        });

        test('should reject short passwords', () => {
            expect(Validator.isStrongPassword('Pa$s1')).toBe(false);
            expect(Validator.isStrongPassword('Aa1!')).toBe(false);
            expect(Validator.isStrongPassword('')).toBe(false);
        });

        test('should validate passwords with exactly 8 characters', () => {
            expect(Validator.isStrongPassword('Pass1@rd')).toBe(true);
            expect(Validator.isStrongPassword('Aa1!Aa1!')).toBe(true);
        });

        test('should validate long passwords', () => {
            expect(Validator.isStrongPassword('ThisIsAVeryL0ng!Password')).toBe(true);
            expect(Validator.isStrongPassword('Sup3r$ecur3P@ssw0rdWithM@nyCharacters')).toBe(true);
        });

        test('should accept all valid special characters', () => {
            expect(Validator.isStrongPassword('Passw0rd!')).toBe(true);
            expect(Validator.isStrongPassword('Passw0rd@')).toBe(true);
            expect(Validator.isStrongPassword('Passw0rd#')).toBe(true);
            expect(Validator.isStrongPassword('Passw0rd$')).toBe(true);
            expect(Validator.isStrongPassword('Passw0rd%')).toBe(true);
            expect(Validator.isStrongPassword('Passw0rd^')).toBe(true);
            expect(Validator.isStrongPassword('Passw0rd&')).toBe(true);
            expect(Validator.isStrongPassword('Passw0rd*')).toBe(true);
        });

        test('should reject passwords with only invalid special characters', () => {
            expect(Validator.isStrongPassword('Passw0rd.')).toBe(false);
            expect(Validator.isStrongPassword('Passw0rd-')).toBe(false);
            expect(Validator.isStrongPassword('Passw0rd_')).toBe(false);
        });
    });

    test.describe('isURL', () => {
        test('should validate correct URLs with https', () => {
            expect(Validator.isURL('https://example.com')).toBe(true);
            expect(Validator.isURL('https://www.example.com')).toBe(true);
            expect(Validator.isURL('https://example.com/path')).toBe(true);
            expect(Validator.isURL('https://example.com/path?query=value')).toBe(true);
        });

        test('should validate correct URLs with http', () => {
            expect(Validator.isURL('http://example.com')).toBe(true);
            expect(Validator.isURL('http://www.example.com')).toBe(true);
        });

        test('should validate URLs with port numbers', () => {
            expect(Validator.isURL('http://example.com:8080')).toBe(true);
            expect(Validator.isURL('https://example.com:443')).toBe(true);
        });

        test('should validate URLs with subdomains', () => {
            expect(Validator.isURL('https://api.example.com')).toBe(true);
            expect(Validator.isURL('https://mail.google.com')).toBe(true);
        });

        test('should validate URLs with paths', () => {
            expect(Validator.isURL('https://example.com/path/to/resource')).toBe(true);
            expect(Validator.isURL('https://example.com/path/with-dashes')).toBe(true);
        });

        test('should validate URLs with query parameters', () => {
            expect(Validator.isURL('https://example.com?param=value')).toBe(true);
            expect(Validator.isURL('https://example.com?a=1&b=2&c=3')).toBe(true);
        });

        test('should validate URLs with fragments', () => {
            expect(Validator.isURL('https://example.com#section')).toBe(true);
            expect(Validator.isURL('https://example.com/page#top')).toBe(true);
        });

        test('should reject invalid URLs', () => {
            expect(Validator.isURL('not a url')).toBe(false);
            expect(Validator.isURL('example.com')).toBe(false);
            expect(Validator.isURL('www.example.com')).toBe(false);
            expect(Validator.isURL('//example.com')).toBe(false);
        });

        test('should reject empty strings', () => {
            expect(Validator.isURL('')).toBe(false);
            expect(Validator.isURL('   ')).toBe(false);
        });

        test('should validate URLs with special characters', () => {
            expect(Validator.isURL('https://example.com/path%20with%20spaces')).toBe(true);
            expect(Validator.isURL('https://example.com/path?query=hello%20world')).toBe(true);
        });

        test('should validate localhost URLs', () => {
            expect(Validator.isURL('http://localhost:3000')).toBe(true);
            expect(Validator.isURL('http://localhost')).toBe(true);
        });

        test('should validate IP address URLs', () => {
            expect(Validator.isURL('http://192.168.1.1')).toBe(true);
            expect(Validator.isURL('https://127.0.0.1:8080')).toBe(true);
        });

        test('should validate other protocols', () => {
            expect(Validator.isURL('ftp://files.example.com')).toBe(true);
            expect(Validator.isURL('ws://websocket.example.com')).toBe(true);
        });
    });

    test.describe('integration tests', () => {
        test('should validate user registration data', () => {
            const email = 'user@example.com';
            const password = 'MyP@ssw0rd123';

            expect(Validator.isEmail(email)).toBe(true);
            expect(Validator.isStrongPassword(password)).toBe(true);
        });

        test('should reject invalid registration data', () => {
            const invalidEmail = 'not-an-email';
            const weakPassword = 'password';

            expect(Validator.isEmail(invalidEmail)).toBe(false);
            expect(Validator.isStrongPassword(weakPassword)).toBe(false);
        });

        test('should validate profile data with URL', () => {
            const email = 'user@example.com';
            const website = 'https://user-portfolio.com';

            expect(Validator.isEmail(email)).toBe(true);
            expect(Validator.isURL(website)).toBe(true);
        });

        test('should handle batch validation', () => {
            const emails = [
                'valid@example.com',
                'invalid',
                'another@valid.com',
                'not-valid@'
            ];

            const validEmails = emails.filter(email => Validator.isEmail(email));
            expect(validEmails).toHaveLength(2);
            expect(validEmails).toEqual(['valid@example.com', 'another@valid.com']);
        });

        test('should validate complex scenarios', () => {
            interface UserData {
                email: string;
                password: string;
                website?: string;
            }

            const userData: UserData = {
                email: 'test@example.com',
                password: 'Secur3P@ss',
                website: 'https://mysite.com'
            };

            const isValid =
                Validator.isEmail(userData.email) &&
                Validator.isStrongPassword(userData.password) &&
                (!userData.website || Validator.isURL(userData.website));

            expect(isValid).toBe(true);
        });
    });

    test.describe('edge cases and security', () => {
        test('should handle SQL injection attempts in email', () => {
            expect(Validator.isEmail("admin'--@example.com")).toBe(true); // Valid format
            expect(Validator.isEmail("admin'; DROP TABLE users;--")).toBe(false);
        });

        test('should handle very long passwords', () => {
            const longPassword = 'A1b@' + 'x'.repeat(1000);
            expect(Validator.isStrongPassword(longPassword)).toBe(true);
        });

        test('should handle Unicode characters in passwords', () => {
            expect(Validator.isStrongPassword('Pässw0rd!')).toBe(false); // No uppercase ASCII
            expect(Validator.isStrongPassword('Passw0rd!🔐')).toBe(true); // Emoji is okay
        });

        test('should handle XSS attempts in URLs', () => {
            expect(Validator.isURL('javascript:alert(1)')).toBe(true); // Valid URL format
            expect(Validator.isURL('http://example.com/<script>')).toBe(true);
        });
    });
});