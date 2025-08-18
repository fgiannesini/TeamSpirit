import { describe, expect, test, vitest } from 'vitest';
import { todo } from './factory.ts';
import { RandomPriorityModificator, tickJump } from './priority-modificator.ts';

describe('Priority Modificator', () => {
  describe('Random', () => {
    test('Should generate a random priority modifier', () => {
      const priorityModificator = new RandomPriorityModificator(() => 0);
      const userStories = priorityModificator.generate([], 0);
      expect(userStories).toEqual([]);
    });

    test.each([
      [0, 0, 0, 10],
      [0.05, 0.1, 0.1, 3],
      [0.05, 0.01, 0.9, 4],
      [0.08, 0, 0, 0],
    ])(
      'Should generate probability',
      (
        probability1: number,
        probability2: number,
        probability3: number,
        priority: number,
      ) => {
        const randomProvider = vitest
          .fn<() => number>()
          .mockReturnValueOnce(probability1)
          .mockReturnValueOnce(probability2)
          .mockReturnValue(probability3);
        const stories = tickJump(
          [todo()],
          { pChange: 0.08, sigma: 1.8 },
          randomProvider,
        );
        expect(stories).toEqual([todo({ priority })]);
      },
    );
  });
});
