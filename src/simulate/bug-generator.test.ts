import { describe, expect, test } from 'vitest';
import { Backlog, addUserStory } from './backlog.ts';
import { BugGeneratorHandler, computeBugProbability } from './bug-generator.ts';
import { done, ensembleTeam, todo } from './factory.ts';

describe('probability', () => {
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
      expect(computeBugProbability(5, turn, 1)).toBeCloseTo(probability, 2);
    },
  );

  test.each([
    [1, 0.07],
    [2, 0.07],
    [3, 0.02],
  ])(
    'should compute probability for a junior to work on a simple task after %s turns',
    (turn: number, probability: number) => {
      expect(computeBugProbability(1, turn, 1)).toBeCloseTo(probability, 2);
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
      expect(computeBugProbability(3, turn, 3)).toBeCloseTo(probability, 2);
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
      expect(computeBugProbability(5, turn, 5)).toBeCloseTo(probability, 2);
    },
  );

  test.each([
    [1, 0.01],
    [2, 0.01],
    [3, 0],
  ])(
    'should compute probability for an expert to work on a simple task after %s turns',
    (turn: number, probability: number) => {
      expect(computeBugProbability(1, turn, 5)).toBeCloseTo(probability, 2);
    },
  );

  test('should generate two bugs', () => {
    const bugGenerator = new BugGeneratorHandler(
      () => 0,
      () => 1,
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
      const bugGenerator = new BugGeneratorHandler(
        () => 0,
        () => 0.5,
      );
      const backlog = new Backlog([]);
      addUserStory(done({ id: 0, complexity, reviewComplexity }), backlog);
      const bugs = bugGenerator.generate(backlog, ensembleTeam(), 0);
      expect(bugs).toEqual([
        todo({
          id: 1,
          name: 'bug-0',
          complexity: bugComplexity,
          reviewComplexity: bugReviewComplexity,
        }),
      ]);
    },
  );

  test('should not generate a bug', () => {
    const bugGenerator = new BugGeneratorHandler(
      () => 1,
      () => 1,
    );
    const backlog = new Backlog([]);
    addUserStory(done({ id: 0 }), backlog);
    addUserStory(done({ id: 1 }), backlog);
    const bugs = bugGenerator.generate(backlog, ensembleTeam(), 0);
    expect(bugs).toEqual([]);
  });
});
