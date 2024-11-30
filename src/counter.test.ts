import { setupCounter } from './counter.ts';
import { describe, expect, it } from 'vitest';

describe('setupCounter', () => {
  it('should initialize counter with 0 and update on click', () => {
    const button = document.createElement('button');
    setupCounter(button);
    expect(button.innerHTML).toBe('count is 0');
    button.click();
    expect(button.innerHTML).toBe('count is 1');
    button.click();
    expect(button.innerHTML).toBe('count is 2');
  });
});
