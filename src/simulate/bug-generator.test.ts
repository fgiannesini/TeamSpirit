import { describe, expect, test } from 'vitest';
import { addUserStory, Backlog } from './backlog.ts';
import {
  CustomBugGenerator,
  computeBugProbability,
  getBugPriority,
  RandomBugGenerator,
} from './bug-generator.ts';
import { done, ensembleTeam, parallelTeam, todo } from './factory.ts';

describe('Bug generator', () => {
  describe('Random Bug generator', () => {
    test.each([
      [1, 0.18],
      [2, 0.3],
      [3, 0.39],
      [5, 0.3],
      [7, 0.08],
      [10, 0],
    ])(
      'should compute probability for a junior to work on a complex task after %s turns',
      (turn: number, probability: number) => {
        expect(computeBugProbability(5, turn, 1, 1)).toBeCloseTo(
          probability,
          2,
        );
      },
    );

    test.each([
      [0, 0.58],
      [1, 0.39],
      [2, 0.26],
      [3, 0.18],
    ])(
      'should compute probability for a junior to work on a complex task with %s reviews',
      (review: number, probability: number) => {
        expect(computeBugProbability(5, 3, 1, review)).toBeCloseTo(
          probability,
          2,
        );
      },
    );

    test.each([
      [0, 0.1],
      [1, 0.07],
      [2, 0.05],
      [3, 0.03],
    ])(
      'should compute probability for a junior to work on a simple task with %s reviews',
      (review: number, probability: number) => {
        expect(computeBugProbability(1, 1, 1, review)).toBeCloseTo(
          probability,
          2,
        );
      },
    );

    test.each([
      [1, 0.07],
      [2, 0.07],
      [3, 0.02],
    ])(
      'should compute probability for a junior to work on a simple task after %s turns',
      (turn: number, probability: number) => {
        expect(computeBugProbability(1, turn, 1, 1)).toBeCloseTo(
          probability,
          2,
        );
      },
    );

    test.each([
      [1, 0.08],
      [2, 0.14],
      [3, 0.14],
      [4, 0.08],
    ])(
      'should compute probability for a confirmed to work on a intermediate task after %s turns',
      (turn: number, probability: number) => {
        expect(computeBugProbability(3, turn, 3, 1)).toBeCloseTo(
          probability,
          2,
        );
      },
    );

    test.each([
      [1, 0.04],
      [2, 0.06],
      [3, 0.08],
      [4, 0.08],
      [5, 0.06],
      [6, 0.04],
    ])(
      'should compute probability for an expert to work on a complex task after %s turns',
      (turn: number, probability: number) => {
        expect(computeBugProbability(5, turn, 5, 1)).toBeCloseTo(
          probability,
          2,
        );
      },
    );

    test.each([
      [0, 0.12],
      [1, 0.08],
      [2, 0.05],
      [3, 0.04],
    ])(
      'should compute probability for an expert to work on a complex task with %s reviews',
      (review: number, probability: number) => {
        expect(computeBugProbability(5, 3, 5, review)).toBeCloseTo(
          probability,
          2,
        );
      },
    );

    test.each([
      [1, 0.01],
      [2, 0.01],
      [3, 0],
    ])(
      'should compute probability for an expert to work on a simple task after %s turns',
      (turn: number, probability: number) => {
        expect(computeBugProbability(1, turn, 5, 1)).toBeCloseTo(
          probability,
          2,
        );
      },
    );

    test('should generate two bugs', () => {
      const bugGenerator = new RandomBugGenerator(
        () => 0,
        () => 1,
        () => 0,
      );
      const backlog = new Backlog([]);
      addUserStory(done({ id: 0 }), backlog);
      addUserStory(done({ id: 1 }), backlog);
      const bugs = bugGenerator.generate(backlog, ensembleTeam(), 0);
      expect(bugs).toEqual([
        todo({ id: 2, name: 'bug-0' }),
        todo({ id: 3, name: 'bug-1' }),
      ]);
    });

    test('should generate one bug with review', () => {
      const bugGenerator = new RandomBugGenerator(
        () => 0,
        () => 1,
        () => 0,
      );
      const backlog = new Backlog([]);
      addUserStory(
        done({
          id: 0,
          review: {
            reviewComplexity: 1,
            reviewers: new Map([[0, 1]]),
          },
        }),
        backlog,
      );
      const bugs = bugGenerator.generate(backlog, parallelTeam(), 0);
      expect(bugs).toEqual([
        todo({
          id: 1,
          name: 'bug-0',
          review: {
            reviewComplexity: 1,
            reviewers: new Map<number, number>(),
          },
        }),
      ]);
    });

    test('should generate one bug with priority', () => {
      const bugGenerator = new RandomBugGenerator(
        () => 0,
        () => 0,
        () => 0.99,
      );
      const backlog = new Backlog([]);
      addUserStory(
        done({
          id: 0,
          priority: 3,
        }),
        backlog,
      );
      const bugs = bugGenerator.generate(backlog, parallelTeam(), 0);
      expect(bugs).toEqual([
        todo({
          id: 1,
          name: 'bug-0',
          priority: 5,
        }),
      ]);
    });

    test.each([
      [3, 1, 0],
      [3, 3, 0.5],
      [3, 5, 0.99],
      [1, 0, 0],
    ])(
      'should generate bug priority %s when probability is %s',
      (actualPriority, expectedPriority, priorityProbability) => {
        expect(
          getBugPriority(actualPriority, () => priorityProbability),
        ).toEqual(expectedPriority);
      },
    );

    test.each([
      [1, 1, 2, 2],
      [1, 1, 1, 1],
      [3, 2, 6, 4],
      [2, 1, 5, 3],
    ])(
      'should compute the bug complexity %s and review complexity %s based on the user story complexity %s and review complexity %s',
      (
        bugComplexity: number,
        bugReviewComplexity: number,
        complexity: number,
        reviewComplexity: number,
      ) => {
        const bugGenerator = new RandomBugGenerator(
          () => 0,
          () => 0.5,
          () => 0,
        );
        const backlog = new Backlog([]);
        addUserStory(
          done({
            id: 0,
            complexity,
            review: {
              reviewers: new Map<number, number>(),
              reviewComplexity,
            },
          }),
          backlog,
        );
        const bugs = bugGenerator.generate(backlog, ensembleTeam(), 0);
        expect(bugs).toEqual([
          todo({
            id: 1,
            name: 'bug-0',
            complexity: bugComplexity,
            review: {
              reviewComplexity: bugReviewComplexity,
              reviewers: new Map<number, number>(),
            },
          }),
        ]);
      },
    );

    test('should not generate a bug', () => {
      const bugGenerator = new RandomBugGenerator(
        () => 1,
        () => 1,
        () => 0,
      );
      const backlog = new Backlog([]);
      addUserStory(done({ id: 0 }), backlog);
      addUserStory(done({ id: 1 }), backlog);
      const bugs = bugGenerator.generate(backlog, ensembleTeam(), 0);
      expect(bugs).toEqual([]);
    });
  });

  describe('Custom bug generator', () => {
    test('should generate two bugs', () => {
      const customBugGenerator = new CustomBugGenerator([
        {
          complexity: 1,
          reviewComplexity: 1,
          time: 1,
        },
        {
          complexity: 2,
          reviewComplexity: 2,
          time: 2,
        },
      ]);
      expect(
        customBugGenerator.generate(
          new Backlog([todo({ id: 0 })]),
          parallelTeam(),
          1,
        ),
      ).toStrictEqual([todo({ id: 1, name: 'bug-0' })]);
      expect(
        customBugGenerator.generate(
          new Backlog([todo({ id: 0 })]),
          parallelTeam(),
          2,
        ),
      ).toStrictEqual([
        todo({
          id: 2,
          name: 'bug-1',
          complexity: 2,
          review: {
            reviewComplexity: 2,
            reviewers: new Map(),
          },
        }),
      ]);
    });

    test('should not generate a bug when not on time', () => {
      const customBugGenerator = new CustomBugGenerator([
        {
          complexity: 1,
          reviewComplexity: 1,
          time: 1,
        },
      ]);
      const userStories = customBugGenerator.generate(
        new Backlog([]),
        parallelTeam(),
        3,
      );
      expect(userStories).toStrictEqual([]);
    });
  });
});
