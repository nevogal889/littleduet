// Minimal jest globals for the offline logic type-check (tools/tsconfig.logic.json).
// The real project uses @types/jest.
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void | Promise<void>): void;
declare function test(name: string, fn: () => void | Promise<void>): void;
declare function beforeEach(fn: () => void | Promise<void>): void;
interface Matchers {
  toBe(v: unknown): void;
  toEqual(v: unknown): void;
  toMatchObject(v: unknown): void;
  toBeCloseTo(v: number, digits?: number): void;
  toBeGreaterThan(v: number): void;
  toBeGreaterThanOrEqual(v: number): void;
  toBeLessThan(v: number): void;
  toBeLessThanOrEqual(v: number): void;
  toHaveLength(n: number): void;
  toMatch(v: RegExp | string): void;
  toContain(v: unknown): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  toThrow(): void;
  not: Matchers;
}
declare function expect(v: unknown): Matchers;

// Metro / jest provide CommonJS require (lazy lesson loading in src/data/lessons/index.ts).
declare function require(id: string): any;
