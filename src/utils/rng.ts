/**
 * Random number generator utilities
 */

/**
 * Generate a random integer between min and max (inclusive).
 *
 * Ensures that `min` and `max` are finite numbers and that `min` is not
 * greater than `max`.
 *
 * @param min The minimum value. Must be a finite number.
 * @param max The maximum value. Must be a finite number and >= min.
 * @returns A random integer between `min` and `max` (inclusive).
 * @throws {Error} If `min` or `max` are not finite numbers.
 * @throws {Error} If `min` is greater than `max`.
 */
export function randomInt(min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error('Inputs "min" and "max" must be finite numbers.');
  }

  if (min > max) {
    throw new Error('Input "min" cannot be greater than "max".');
  }
  // Standard formula for inclusive random integer.
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random float
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Return true with a given probability
 * @param probability Probability between 0 and 1
 * @returns Boolean result
 */
export function randomChance(probability: number): boolean {
  return Math.random() < probability;
}

/**
 * Pick a random item from an array
 * @param array Array of items
 * @returns Random item from the array
 */
export function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param array Array to shuffle
 * @returns Shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a weighted random selection from an array
 * @param items Array of items
 * @param weights Array of weights (same length as items)
 * @returns Randomly selected item
 */
export function weightedRandom<T>(items: T[], weights: number[]): T {
  if (items.length !== weights.length) {
    throw new Error('Items and weights arrays must have the same length');
  }
  
  // Calculate sum of weights
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  // Generate random value between 0 and total weight
  const random = Math.random() * totalWeight;
  
  // Find the item corresponding to the random value
  let weightSum = 0;
  for (let i = 0; i < items.length; i++) {
    weightSum += weights[i];
    if (random < weightSum) {
      return items[i];
    }
  }
  
  // Fallback (should never reach here)
  return items[items.length - 1];
}
