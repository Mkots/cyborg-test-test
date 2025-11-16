import { test, expect } from '@playwright/test';

import { AsyncHelper } from '../../src/utils';
import {AssertionError} from "node:assert";

const fail = (message: string) => {
    throw new AssertionError({ message });
}

test.describe('AsyncHelper', () => {
    test.describe('delay', () => {
        test('should delay execution', async () => {
            const start = Date.now();
            await AsyncHelper.delay(100);
            const elapsed = Date.now() - start;
            expect(elapsed).toBeGreaterThanOrEqual(95); // Allow some margin
        });

        test('should handle zero delay', async () => {
            await expect(AsyncHelper.delay(0)).resolves.toBeUndefined();
        });

        test('should return a promise', () => {
            const result = AsyncHelper.delay(50);
            expect(result).toBeInstanceOf(Promise);
        });
    });

    test.describe('fetchUser', () => {
        test('should fetch user with valid ID', async () => {
            const user = await AsyncHelper.fetchUser(1);
            expect(user).toEqual({ id: 1, name: 'User 1' });
        });

        test('should fetch different users', async () => {
            const user1 = await AsyncHelper.fetchUser(1);
            const user2 = await AsyncHelper.fetchUser(2);

            expect(user1.id).toBe(1);
            expect(user2.id).toBe(2);
            expect(user1.name).toBe('User 1');
            expect(user2.name).toBe('User 2');
        });

        test('should throw error for invalid ID (zero)', async () => {
            await expect(AsyncHelper.fetchUser(0)).rejects.toThrow('Invalid user ID');
        });

        test('should throw error for negative ID', async () => {
            await expect(AsyncHelper.fetchUser(-1)).rejects.toThrow('Invalid user ID');
        });

        test('should handle concurrent requests', async () => {
            const results = await Promise.all([
                AsyncHelper.fetchUser(1),
                AsyncHelper.fetchUser(2),
                AsyncHelper.fetchUser(3)
            ]);

            expect(results).toHaveLength(3);
            expect(results[0].id).toBe(1);
            expect(results[1].id).toBe(2);
            expect(results[2].id).toBe(3);
        });

        test('should take approximately 100ms', async () => {
            const start = Date.now();
            await AsyncHelper.fetchUser(1);
            const elapsed = Date.now() - start;

            expect(elapsed).toBeGreaterThanOrEqual(95);
            expect(elapsed).toBeLessThan(200);
        });
    });

    test.describe('retryOperation', () => {
        test('should succeed on first try', async () => {
            let attempts = 0;
            const operation = async () => {
                attempts++;
                return 'success';
            };

            const result = await AsyncHelper.retryOperation(operation, 3);
            expect(result).toBe('success');
            expect(attempts).toBe(1);
        });

        test('should retry on failure and eventually succeed', async () => {
            let attempts = 0;
            const operation = async () => {
                attempts++;
                if (attempts < 3) {
                    throw new Error('Temporary failure');
                }
                return 'success';
            };

            const result = await AsyncHelper.retryOperation(operation, 3);
            expect(result).toBe('success');
            expect(attempts).toBe(3);
        });

        test('should throw error after max retries', async () => {
            let attempts = 0;
            const operation = async () => {
                attempts++;
                throw new Error('Permanent failure');
            };

            await expect(
                AsyncHelper.retryOperation(operation, 3)
            ).rejects.toThrow('Permanent failure');

            expect(attempts).toBe(3);
        });

        test('should use default retry count of 3', async () => {
            let attempts = 0;
            const operation = async () => {
                attempts++;
                throw new Error('Always fails');
            };

            await expect(
                AsyncHelper.retryOperation(operation)
            ).rejects.toThrow('Always fails');

            expect(attempts).toBe(3);
        });

        test('should delay between retries', async () => {
            let attempts = 0;
            const timestamps: number[] = [];

            const operation = async () => {
                attempts++;
                timestamps.push(Date.now());
                if (attempts < 3) {
                    throw new Error('Retry me');
                }
                return 'success';
            };

            await AsyncHelper.retryOperation(operation, 3);

            // Check that there's a delay between attempts
            const delay1 = timestamps[1] - timestamps[0];
            const delay2 = timestamps[2] - timestamps[1];

            expect(delay1).toBeGreaterThanOrEqual(95); // ~100ms
            expect(delay2).toBeGreaterThanOrEqual(195); // ~200ms
        });

        test('should handle immediate success with no retries', async () => {
            const operation = async () => 42;
            const result = await AsyncHelper.retryOperation(operation, 5);
            expect(result).toBe(42);
        });

        test('should work with complex return types', async () => {
            type ComplexType = { data: string; count: number };

            const operation = async (): Promise<ComplexType> => {
                return { data: 'test', count: 123 };
            };

            const result = await AsyncHelper.retryOperation(operation, 3);
            expect(result).toEqual({ data: 'test', count: 123 });
        });
    });

    test.describe('concurrent operations', () => {
        test('should handle multiple concurrent delays', async () => {
            const start = Date.now();

            await Promise.all([
                AsyncHelper.delay(100),
                AsyncHelper.delay(100),
                AsyncHelper.delay(100)
            ]);

            const elapsed = Date.now() - start;

            // Should run in parallel, not sequentially
            expect(elapsed).toBeLessThan(300);
            expect(elapsed).toBeGreaterThanOrEqual(95);
        });

        test('should handle race conditions', async () => {
            const results = await Promise.race([
                AsyncHelper.fetchUser(1),
                AsyncHelper.delay(200).then(() => ({ id: 999, name: 'Timeout' }))
            ]);

            // fetchUser should win (100ms vs 200ms)
            expect(results.id).toBe(1);
        });

        test('should handle mixed success and failure', async () => {
            const results = await Promise.allSettled([
                AsyncHelper.fetchUser(1),
                AsyncHelper.fetchUser(-1), // This will fail
                AsyncHelper.fetchUser(2)
            ]);

            expect(results[0].status).toBe('fulfilled');
            expect(results[1].status).toBe('rejected');
            expect(results[2].status).toBe('fulfilled');

            if (results[0].status === 'fulfilled') {
                expect(results[0].value.id).toBe(1);
            }
        });
    });

    test.describe('error handling', () => {
        test('should preserve error messages through retries', async () => {
            const operation = async () => {
                throw new Error('Specific error message');
            };

            try {
                await AsyncHelper.retryOperation(operation, 2);
                fail('Should have thrown an error');
            } catch (error) {
                expect((error as Error).message).toBe('Specific error message');
            }
        });

        test('should handle async errors in fetchUser', async () => {
            const errors: Error[] = [];

            try {
                await AsyncHelper.fetchUser(0);
            } catch (error) {
                errors.push(error as Error);
            }

            try {
                await AsyncHelper.fetchUser(-5);
            } catch (error) {
                errors.push(error as Error);
            }

            expect(errors).toHaveLength(2);
            expect(errors.every(e => e.message === 'Invalid user ID')).toBe(true);
        });
    });

    test.describe('performance tests', () => {
        test('should handle many concurrent operations', async () => {
            const operations = Array.from({ length: 50 }, (_, i) =>
                AsyncHelper.fetchUser(i + 1)
            );

            const start = Date.now();
            const results = await Promise.all(operations);
            const elapsed = Date.now() - start;

            expect(results).toHaveLength(50);
            // Should complete in roughly the same time as a single operation
            expect(elapsed).toBeLessThan(300);
        });
    });
});