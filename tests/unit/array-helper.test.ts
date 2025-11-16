import { test, expect } from '@playwright/test';

import { ArrayHelper } from '../../src/utils';

test.describe('ArrayHelper', () => {
    test.describe('unique', () => {
        test('should remove duplicate numbers', () => {
            expect(ArrayHelper.unique([1, 2, 2, 3, 4, 4, 5])).toEqual([1, 2, 3, 4, 5]);
        });

        test('should remove duplicate strings', () => {
            expect(ArrayHelper.unique(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
        });

        test('should handle empty array', () => {
            expect(ArrayHelper.unique([])).toEqual([]);
        });

        test('should handle array with no duplicates', () => {
            expect(ArrayHelper.unique([1, 2, 3])).toEqual([1, 2, 3]);
        });

        test('should handle array with all duplicates', () => {
            expect(ArrayHelper.unique([1, 1, 1, 1])).toEqual([1]);
        });

        test('should preserve order of first occurrence', () => {
            expect(ArrayHelper.unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
        });

        test('should handle mixed types', () => {
            const mixed: (string | number)[] = [1, 'a', 2, 'a', 1];
            expect(ArrayHelper.unique(mixed)).toEqual([1, 'a', 2]);
        });
    });

    test.describe('chunk', () => {
        test('should split array into chunks of specified size', () => {
            expect(ArrayHelper.chunk([1, 2, 3, 4, 5], 2)).toEqual([
                [1, 2],
                [3, 4],
                [5]
            ]);
        });

        test('should handle exact division', () => {
            expect(ArrayHelper.chunk([1, 2, 3, 4], 2)).toEqual([
                [1, 2],
                [3, 4]
            ]);
        });

        test('should handle chunk size of 1', () => {
            expect(ArrayHelper.chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
        });

        test('should handle chunk size larger than array', () => {
            expect(ArrayHelper.chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
        });

        test('should handle empty array', () => {
            expect(ArrayHelper.chunk([], 2)).toEqual([]);
        });

        test('should handle strings', () => {
            expect(ArrayHelper.chunk(['a', 'b', 'c', 'd', 'e'], 2)).toEqual([
                ['a', 'b'],
                ['c', 'd'],
                ['e']
            ]);
        });
    });

    test.describe('flatten', () => {
        test('should flatten nested arrays', () => {
            expect(ArrayHelper.flatten([1, [2, 3], 4, [5]])).toEqual([1, 2, 3, 4, 5]);
        });

        test('should handle single level array', () => {
            expect(ArrayHelper.flatten([1, 2, 3])).toEqual([1, 2, 3]);
        });

        test('should handle empty array', () => {
            expect(ArrayHelper.flatten([])).toEqual([]);
        });

        test('should handle array with empty nested arrays', () => {
            expect(ArrayHelper.flatten([1, [], 2, [], 3])).toEqual([1, 2, 3]);
        });

        test('should handle all nested arrays', () => {
            expect(ArrayHelper.flatten([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
        });

        test('should handle strings', () => {
            expect(ArrayHelper.flatten(['a', ['b', 'c'], 'd'])).toEqual(['a', 'b', 'c', 'd']);
        });
    });

    test.describe('sum', () => {
        test('should sum positive numbers', () => {
            expect(ArrayHelper.sum([1, 2, 3, 4, 5])).toBe(15);
        });

        test('should handle negative numbers', () => {
            expect(ArrayHelper.sum([-1, -2, -3])).toBe(-6);
        });

        test('should handle mixed positive and negative', () => {
            expect(ArrayHelper.sum([1, -2, 3, -4, 5])).toBe(3);
        });

        test('should return 0 for empty array', () => {
            expect(ArrayHelper.sum([])).toBe(0);
        });

        test('should handle single element', () => {
            expect(ArrayHelper.sum([42])).toBe(42);
        });

        test('should handle zeros', () => {
            expect(ArrayHelper.sum([0, 0, 0])).toBe(0);
        });

        test('should handle decimal numbers', () => {
            expect(ArrayHelper.sum([1.5, 2.5, 3])).toBe(7);
        });

        test('should handle large numbers', () => {
            expect(ArrayHelper.sum([1000000, 2000000, 3000000])).toBe(6000000);
        });
    });

    test.describe('average', () => {
        test('should calculate average of positive numbers', () => {
            expect(ArrayHelper.average([1, 2, 3, 4, 5])).toBe(3);
        });

        test('should handle decimal averages', () => {
            expect(ArrayHelper.average([1, 2, 3])).toBe(2);
        });

        test('should return 0 for empty array', () => {
            expect(ArrayHelper.average([])).toBe(0);
        });

        test('should handle single element', () => {
            expect(ArrayHelper.average([42])).toBe(42);
        });

        test('should handle negative numbers', () => {
            expect(ArrayHelper.average([-1, -2, -3])).toBe(-2);
        });

        test('should handle zeros', () => {
            expect(ArrayHelper.average([0, 0, 0])).toBe(0);
        });

        test('should handle mixed numbers', () => {
            expect(ArrayHelper.average([10, 20, 30])).toBe(20);
        });
    });

    test.describe('integration tests', () => {
        test('should chain operations', () => {
            const data = [1, 2, 2, 3, 4, 4, 5];
            const unique = ArrayHelper.unique(data);
            const sum = ArrayHelper.sum(unique);
            expect(sum).toBe(15); // 1+2+3+4+5
        });

        test('should work with flattened and summed data', () => {
            const nested = [1, [2, 3], 4, [5]];
            const flat = ArrayHelper.flatten(nested);
            const total = ArrayHelper.sum(flat);
            expect(total).toBe(15);
        });

        test('should chunk and calculate averages', () => {
            const data = [1, 2, 3, 4, 5, 6];
            const chunks = ArrayHelper.chunk(data, 3);
            const averages = chunks.map(chunk => ArrayHelper.average(chunk));
            expect(averages).toEqual([2, 5]); // avg([1,2,3])=2, avg([4,5,6])=5
        });
    });

    test.describe('edge cases', () => {
        test('should handle large arrays', () => {
            const large = Array.from({ length: 10000 }, (_, i) => i);
            const sum = ArrayHelper.sum(large);
            expect(sum).toBe(49995000); // sum of 0 to 9999
        });

        test('should handle sparse arrays', () => {
            const sparse = [1, , , 4]; // eslint-disable-line no-sparse-arrays
            const filtered = sparse.filter(x => x !== undefined);
            expect(ArrayHelper.sum(filtered)).toBe(5);
        });
    });
});