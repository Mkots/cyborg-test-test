import { test, expect } from '@playwright/test';

import { StringHelper } from '../../src/utils';

test.describe('StringHelper', () => {
    test.describe('capitalize', () => {
        test('should capitalize first letter of lowercase string', () => {
            expect(StringHelper.capitalize('hello')).toBe('Hello');
        });

        test('should keep already capitalized string', () => {
            expect(StringHelper.capitalize('Hello')).toBe('Hello');
        });

        test('should handle empty string', () => {
            expect(StringHelper.capitalize('')).toBe('');
        });

        test('should handle single character', () => {
            expect(StringHelper.capitalize('a')).toBe('A');
        });

        test('should only capitalize first letter', () => {
            expect(StringHelper.capitalize('hello world')).toBe('Hello world');
        });

        test('should handle strings with numbers', () => {
            expect(StringHelper.capitalize('123abc')).toBe('123abc');
        });
    });

    test.describe('reverse', () => {
        test('should reverse a simple string', () => {
            expect(StringHelper.reverse('hello')).toBe('olleh');
        });

        test('should handle empty string', () => {
            expect(StringHelper.reverse('')).toBe('');
        });

        test('should handle single character', () => {
            expect(StringHelper.reverse('a')).toBe('a');
        });

        test('should handle palindromes', () => {
            expect(StringHelper.reverse('racecar')).toBe('racecar');
        });

        test('should handle strings with spaces', () => {
            expect(StringHelper.reverse('hello world')).toBe('dlrow olleh');
        });

        test('should handle special characters', () => {
            expect(StringHelper.reverse('!@#$%')).toBe('%$#@!');
        });
    });

    test.describe('isPalindrome', () => {
        test('should return true for simple palindromes', () => {
            expect(StringHelper.isPalindrome('racecar')).toBe(true);
            expect(StringHelper.isPalindrome('level')).toBe(true);
        });

        test('should return false for non-palindromes', () => {
            expect(StringHelper.isPalindrome('hello')).toBe(false);
            expect(StringHelper.isPalindrome('world')).toBe(false);
        });

        test('should ignore case', () => {
            expect(StringHelper.isPalindrome('Racecar')).toBe(true);
            expect(StringHelper.isPalindrome('RaceCar')).toBe(true);
        });

        test('should ignore spaces and punctuation', () => {
            expect(StringHelper.isPalindrome('A man a plan a canal Panama')).toBe(true);
            expect(StringHelper.isPalindrome('race a car')).toBe(false);
        });

        test('should handle empty string', () => {
            expect(StringHelper.isPalindrome('')).toBe(true);
        });

        test('should handle single character', () => {
            expect(StringHelper.isPalindrome('a')).toBe(true);
        });

        test('should handle numbers', () => {
            expect(StringHelper.isPalindrome('12321')).toBe(true);
            expect(StringHelper.isPalindrome('12345')).toBe(false);
        });
    });

    test.describe('truncate', () => {
        test('should truncate long strings', () => {
            expect(StringHelper.truncate('Hello World', 8)).toBe('Hello...');
        });

        test('should not truncate short strings', () => {
            expect(StringHelper.truncate('Hello', 10)).toBe('Hello');
        });

        test('should handle exact length', () => {
            expect(StringHelper.truncate('Hello', 5)).toBe('Hello');
        });

        test('should handle empty string', () => {
            expect(StringHelper.truncate('', 5)).toBe('');
        });

        test('should handle maxLength of 3 (edge case)', () => {
            expect(StringHelper.truncate('Hello', 3)).toBe('...');
        });

        test('should truncate at word boundary', () => {
            const long = 'This is a very long sentence that needs truncation';
            const result = StringHelper.truncate(long, 20);
            expect(result).toBe('This is a very lo...');
            expect(result.length).toBe(20);
        });
    });

    test.describe('integration tests', () => {
        test('should combine multiple operations', () => {
            const input = 'hello world';
            const capitalized = StringHelper.capitalize(input);
            const reversed = StringHelper.reverse(capitalized);
            expect(reversed).toBe('dlrow olleH');
        });

        test('should handle Unicode characters', () => {
            expect(StringHelper.reverse('Hello 👋 World')).toBe('dlroW 👋 olleH');
            expect(StringHelper.capitalize('café')).toBe('Café');
        });
    });
});