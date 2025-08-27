import { describe, expect, test, vitest } from 'vitest';
import { todo } from './factory.ts';
import {
  CustomPriorityModificator,
  noPriorityModificator,
  RandomPriorityModificator,
  tickJump,
} from './priority-modificator.ts';

describe('Priority Modificator', () => {
  describe('Random', () => {
    test('Should not modify priority', () => {
      const priorityModificator = new RandomPriorityModificator(() => 0.2);
      const userStories = priorityModificator.generate([todo()], 0);
      expect(userStories).toEqual({
        userStories: [todo()],
        modifications: [],
      });
    });

    test('Should modify priority', () => {
      const randomProvider = vitest
        .fn<() => number>()
        .mockReturnValueOnce(0.05)
        .mockReturnValue(0.2);
      const priorityModificator = new RandomPriorityModificator(randomProvider);
      const userStories = priorityModificator.generate(
        [todo({ priority: 0 })],
        0,
      );
      expect(userStories).toEqual({
        userStories: [todo({ priority: 1 })],
        modifications: [{ id: 0, priority: 1 }],
      });
    });

    test.each([
      [0.08, 0, 0, 5],
      [0.05, 0.000_01, 0.000_01, 10],
      [0.05, 0.000_01, 0.999_99, 10],
      [0.05, 0.000_01, 0.5, 0],
      [0.05, 0.5, 0.5, 4],
      [0.05, 0.01, 0.5, 2],
      [0.05, 0.01, 0.01, 8],
      [0.05, 0.99, 0.5, 5],
    ])(
      'Should generate probability with change probability %s Box Moller %s and %s',
      (
        changeProbability: number,
        boxMuller1: number,
        boxMuller2: number,
        expectedPriority: number,
      ) => {
        const randomProvider = vitest
          .fn<() => number>()
          .mockReturnValueOnce(changeProbability)
          .mockReturnValueOnce(boxMuller1)
          .mockReturnValue(boxMuller2);
        const newPriority = tickJump(5, randomProvider);
        expect(newPriority).toEqual(expectedPriority);
      },
    );
  });

  describe('Custom', () => {
    test('should not modify a priority if not on right time', () => {
      const customPriorityModificator = new CustomPriorityModificator([
        {
          time: 1,
          id: 0,
          priority: 5,
        },
      ]);
      const actual = customPriorityModificator.generate([todo()], 2);
      expect(actual).toEqual({ userStories: [todo()], modifications: [] });
    });

    test('should not modify a priority if equal to the previous one', () => {
      const customPriorityModificator = new CustomPriorityModificator([
        {
          time: 1,
          id: 0,
          priority: 0,
        },
      ]);
      const actual = customPriorityModificator.generate([todo()], 1);
      expect(actual).toEqual({ userStories: [todo()], modifications: [] });
    });

    test('should modify a priority if on right time', () => {
      const customPriorityModificator = new CustomPriorityModificator([
        {
          time: 1,
          id: 0,
          priority: 5,
        },
      ]);
      const actual = customPriorityModificator.generate([todo()], 1);
      expect(actual).toEqual({
        userStories: [todo({ priority: 5 })],
        modifications: [{ id: 0, priority: 5 }],
      });
    });
  });

  describe('No', () => {
    test('should not modify a priority', () => {
      const actual = noPriorityModificator.generate([todo()], 1);
      expect(actual).toEqual({
        userStories: [todo()],
        modifications: [],
      });
    });
  });
});
