import { test, expect } from '@playwright/test';

import { Calculator } from '../../src/utils';

test.describe('Calculator', () => {
    let calculator: Calculator;

    test.beforeEach(() => {
        calculator = new Calculator();
    });

    test.describe('add', () => {
        test('should add two positive numbers', () => {
            expect(calculator.add(2, 3)).toBe(5);
        });

        test('should add negative numbers', () => {
            expect(calculator.add(-5, -3)).toBe(-8);
        });

        test('should add positive and negative numbers', () => {
            expect(calculator.add(10, -3)).toBe(7);
        });

        test('should handle zero', () => {
            expect(calculator.add(0, 5)).toBe(5);
            expect(calculator.add(5, 0)).toBe(5);
        });

        test('should handle decimal numbers', () => {
            expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
        });

        test('should handle large numbers', () => {
            expect(calculator.add(1000000, 2000000)).toBe(3000000);
        });
    });

    test.describe('subtract', () => {
        test('should subtract two positive numbers', () => {
            expect(calculator.subtract(5, 3)).toBe(2);
        });

        test('should handle negative results', () => {
            expect(calculator.subtract(3, 5)).toBe(-2);
        });

        test('should subtract negative numbers', () => {
            expect(calculator.subtract(-5, -3)).toBe(-2);
        });

        test('should handle zero', () => {
            expect(calculator.subtract(5, 0)).toBe(5);
            expect(calculator.subtract(0, 5)).toBe(-5);
        });
    });

    test.describe('multiply', () => {
        test('should multiply two positive numbers', () => {
            expect(calculator.multiply(3, 4)).toBe(12);
        });

        test('should handle multiplication by zero', () => {
            expect(calculator.multiply(5, 0)).toBe(0);
            expect(calculator.multiply(0, 5)).toBe(0);
        });

        test('should handle negative numbers', () => {
            expect(calculator.multiply(-3, 4)).toBe(-12);
            expect(calculator.multiply(-3, -4)).toBe(12);
        });

        test('should handle decimal numbers', () => {
            expect(calculator.multiply(2.5, 4)).toBe(10);
        });
    });

    test.describe('divide', () => {
        test('should divide two positive numbers', () => {
            expect(calculator.divide(10, 2)).toBe(5);
        });

        test('should handle decimal results', () => {
            expect(calculator.divide(7, 2)).toBe(3.5);
        });

        test('should throw error when dividing by zero', () => {
            expect(() => calculator.divide(5, 0)).toThrow('Division by zero');
        });

        test('should handle negative numbers', () => {
            expect(calculator.divide(-10, 2)).toBe(-5);
            expect(calculator.divide(10, -2)).toBe(-5);
            expect(calculator.divide(-10, -2)).toBe(5);
        });

        test('should handle division resulting in zero', () => {
            expect(calculator.divide(0, 5)).toBe(0);
        });
    });

    test.describe('power', () => {
        test('should calculate power of positive numbers', () => {
            expect(calculator.power(2, 3)).toBe(8);
            expect(calculator.power(5, 2)).toBe(25);
        });

        test('should handle power of zero', () => {
            expect(calculator.power(5, 0)).toBe(1);
        });

        test('should handle base of zero', () => {
            expect(calculator.power(0, 5)).toBe(0);
        });

        test('should handle negative exponents', () => {
            expect(calculator.power(2, -2)).toBe(0.25);
        });

        test('should handle fractional exponents', () => {
            expect(calculator.power(4, 0.5)).toBe(2);
        });
    });

    test.describe('edge cases', () => {
        test('should handle very large numbers', () => {
            const result = calculator.add(Number.MAX_SAFE_INTEGER - 1, 1);
            expect(result).toBe(Number.MAX_SAFE_INTEGER);
        });

        test('should chain operations correctly', () => {
            const result = calculator.add(
                calculator.multiply(2, 3),
                calculator.subtract(10, 5)
            );
            expect(result).toBe(11);
        });
    });
});