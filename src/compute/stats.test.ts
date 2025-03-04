import { describe, expect, test } from 'vitest';
import { computeStatEvents } from './stats.ts';

describe('stats', () => {
  test('create a stat', () => {
    expect(computeStatEvents([])).toEqual([{ time: 0, leadTime: 1 }]);
  });
});
