import {describe, expect, test} from 'vitest';
import {Backlog, getUserStoriesDone, getUserStoriesRemainings,} from './backlog.ts';
import type {TimeEvent} from './events.ts';
import {noReview} from './review.ts';
import {simulate, simulateTimeEvents} from './simulation.ts';
import {ParallelTeam} from './team.ts';
import {State} from './user-story.ts';
import {doneEvent, idleEvent, inProgressEvent, todo} from "./factory.ts";

describe('Simulation', () => {
    test('should have a thread idle', async () => {
        const team = new ParallelTeam([
            {id: 0, name: 'thread0', power: 1},
        ]);
        const backlog = new Backlog([])
        const timeEvents = simulateTimeEvents(team, backlog, 0);
        expect(timeEvents).toEqual([
            idleEvent()
        ])
    })

    test('should have two threads idle', async () => {
        const team = new ParallelTeam([
            {id: 0, name: 'thread0', power: 1},
            {id: 1, name: 'thread1', power: 1},
        ]);
        const backlog = new Backlog([])
        const timeEvents = simulateTimeEvents(team, backlog, 0);
        expect(timeEvents).toEqual([
            idleEvent({threadId: 0}),
            idleEvent({threadId: 1})
        ])
    })

    test('should have a thread develop and done a user story', async () => {
        const team = new ParallelTeam([
            {id: 0, name: 'thread0', power: 1},
        ]);
        const backlog = new Backlog([todo()])
        const timeEvents = simulateTimeEvents(team, backlog, 0);
        expect(timeEvents).toEqual([
            inProgressEvent(),
            doneEvent()
        ])
    })

    test('should handle 2 simple userStories by 2 devs', () => {
        const backlog = new Backlog([
            {
                id: 1,
                name: 'userStory1',
                complexity: 1,
                reviewComplexity: 0,
                review: noReview,
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
            {
                id: 2,
                name: 'userStory2',
                complexity: 1,
                reviewComplexity: 0,
                review: noReview,
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
        ]);

        const team = new ParallelTeam([
            {id: 0, name: 'thread0', power: 1},
            {id: 1, name: 'thread1', power: 1},
        ]);
        const events = simulate(backlog, team);

        expect(events).toEqual<TimeEvent[]>([
            {
                time: 1,
                userStoryId: 1,
                threadId: 0,
                state: State.InProgress,
            },
            {
                time: 1,
                userStoryId: 1,
                threadId: 0,
                state: State.Done,
            },
            {
                time: 1,
                userStoryId: 2,
                threadId: 1,
                state: State.InProgress,
            },
            {
                time: 1,
                userStoryId: 2,
                threadId: 1,
                state: State.Done,
            },
        ]);

        expect(getUserStoriesDone(backlog)).toHaveLength(2);
        expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
    });

    test('should handle 1 simple userStory by an efficient dev', () => {
        const backlog = new Backlog([
            {
                id: 1,
                name: 'userStory1',
                complexity: 5,
                reviewComplexity: 0,
                review: noReview,
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
        ]);

        const team = new ParallelTeam([{id: 0, name: 'thread0', power: 2}]);
        const events = simulate(backlog, team);

        expect(events).toEqual<TimeEvent[]>([
            {
                time: 1,
                userStoryId: 1,
                threadId: 0,
                state: State.InProgress,
            },
            {
                time: 2,
                userStoryId: 1,
                threadId: 0,
                state: State.InProgress,
            },
            {
                time: 3,
                userStoryId: 1,
                threadId: 0,
                state: State.InProgress,
            },
            {
                time: 3,
                userStoryId: 1,
                threadId: 0,
                state: State.Done,
            },
        ]);

        expect(getUserStoriesDone(backlog)).toHaveLength(1);
        expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
    });

    test('should handle 3 simple userStories by 2 devs', () => {
        const backlog = new Backlog([
            {
                id: 1,
                name: 'userStory1',
                complexity: 1,
                reviewComplexity: 0,
                review: noReview,
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
            {
                id: 2,
                name: 'userStory2',
                complexity: 1,
                reviewComplexity: 0,
                review: noReview,
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
            {
                id: 3,
                name: 'userStory3',
                complexity: 1,
                reviewComplexity: 0,
                review: noReview,
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
        ]);

        const team = new ParallelTeam([
            {id: 0, name: 'thread0', power: 1},
            {id: 1, name: 'thread1', power: 1},
        ]);
        const events = simulate(backlog, team);
        expect(events).toEqual([
            {
                time: 1,
                userStoryId: 1,
                threadId: 0,
                state: State.InProgress,
            },
            {
                time: 1,
                userStoryId: 1,
                threadId: 0,
                state: State.Done,
            },
            {
                time: 1,
                userStoryId: 2,
                threadId: 1,
                state: State.InProgress,
            },
            {
                time: 1,
                userStoryId: 2,
                threadId: 1,
                state: State.Done,
            },
            {
                time: 2,
                userStoryId: 3,
                threadId: 0,
                state: State.InProgress,
            },
            {
                time: 2,
                userStoryId: 3,
                threadId: 0,
                state: State.Done,
            },
            {
                time: 2,
                userStoryId: -1,
                threadId: 1,
                state: State.Done,
            },
        ]);

        expect(getUserStoriesDone(backlog)).toHaveLength(3);
        expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
    });

    test('should handle 2 complex userStories by 2 devs', () => {
        const backlog = new Backlog([
            {
                id: 1,
                name: 'userStory1',
                complexity: 2,
                reviewComplexity: 0,
                review: noReview,
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
            {
                id: 2,
                name: 'userStory2',
                complexity: 2,
                reviewComplexity: 0,
                review: noReview,
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
        ]);

        const team = new ParallelTeam([
            {id: 0, name: 'thread0', power: 1},
            {id: 1, name: 'thread1', power: 1},
        ]);
        const events = simulate(backlog, team);
        expect(events).toEqual([
            {
                time: 1,
                userStoryId: 1,
                threadId: 0,
                state: State.InProgress,
            },
            {
                time: 1,
                userStoryId: 2,
                threadId: 1,
                state: State.InProgress,
            },
            {
                time: 2,
                userStoryId: 1,
                threadId: 0,
                state: State.InProgress,
            },
            {
                time: 2,
                userStoryId: 1,
                threadId: 0,
                state: State.Done,
            },
            {
                time: 2,
                userStoryId: 2,
                threadId: 1,
                state: State.InProgress,
            },
            {
                time: 2,
                userStoryId: 2,
                threadId: 1,
                state: State.Done,
            },
        ]);

        expect(getUserStoriesDone(backlog)).toHaveLength(2);
        expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
    });

    test('should handle 1 simple userStory and review', () => {
        const backlog = new Backlog([
            {
                id: 0,
                name: 'userStory0',
                complexity: 1,
                reviewComplexity: 2,
                review: {
                    reviewersNeeded: 1,
                    reviewers: new Map<number, number>(),
                },
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
        ]);

        const team = new ParallelTeam([
            {id: 0, name: 'thread0', power: 1},
            {id: 1, name: 'thread1', power: 1},
        ]);
        const events = simulate(backlog, team);

        expect(events).toEqual([
            {
                time: 1,
                userStoryId: 0,
                threadId: 0,
                state: State.InProgress,
            },
            {
                time: 1,
                userStoryId: 0,
                threadId: 0,
                state: State.ToReview,
            },
            {
                time: 1,
                userStoryId: -1,
                threadId: 1,
                state: State.Done,
            },
            {
                time: 2,
                userStoryId: -1,
                threadId: 0,
                state: State.Done,
            },
            {
                time: 2,
                userStoryId: 0,
                threadId: 1,
                state: State.Review,
            },
            {
                state: State.Done,
                threadId: 0,
                time: 3,
                userStoryId: -1,
            },
            {
                state: State.Review,
                threadId: 1,
                time: 3,
                userStoryId: 0,
            },
            {
                state: State.Done,
                threadId: 0,
                time: 3,
                userStoryId: 0,
            },
        ]);

        expect(getUserStoriesDone(backlog)).toHaveLength(1);
        expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
    });

    test('should handle 1 simple userStory and review by an efficient dev', () => {
        const backlog = new Backlog([
            {
                id: 1,
                name: 'userStory1',
                complexity: 20,
                reviewComplexity: 2,
                review: {
                    reviewersNeeded: 1,
                    reviewers: new Map<number, number>(),
                },
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
        ]);

        const team = new ParallelTeam([
            {
                id: 0,
                name: 'thread0',
                power: 20,
            },
            {
                id: 1,
                name: 'thread1',
                power: 1,
            },
        ]);
        const events = simulate(backlog, team);

        expect(events).toEqual([
            {
                time: 1,
                userStoryId: 1,
                threadId: 0,
                state: State.InProgress,
            },
            {
                time: 1,
                userStoryId: 1,
                threadId: 0,
                state: State.ToReview,
            },
            {
                time: 1,
                userStoryId: -1,
                threadId: 1,
                state: State.Done,
            },
            {
                time: 2,
                userStoryId: -1,
                threadId: 0,
                state: State.Done,
            },
            {
                time: 2,
                userStoryId: 1,
                threadId: 1,
                state: State.Review,
            },
            {
                time: 3,
                userStoryId: -1,
                threadId: 0,
                state: State.Done,
            },
            {
                time: 3,
                userStoryId: 1,
                threadId: 1,
                state: State.Review,
            },
            {
                time: 3,
                userStoryId: 1,
                threadId: 0,
                state: State.Done,
            },
        ]);

        expect(getUserStoriesDone(backlog)).toHaveLength(1);
        expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
    });

    test('should handle 1 simple userStory and review by two devs', () => {
        const backlog = new Backlog([
            {
                id: 1,
                name: 'userStory1',
                complexity: 20,
                reviewComplexity: 2,
                review: {
                    reviewersNeeded: 2,
                    reviewers: new Map<number, number>(),
                },
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
        ]);

        const team = new ParallelTeam([
            {
                id: 0,
                name: 'thread0',
                power: 20,
            },
            {
                id: 1,
                name: 'thread1',
                power: 1,
            },
            {
                id: 2,
                name: 'thread2',
                power: 1,
            },
        ]);
        const events = simulate(backlog, team);

        expect(events).toEqual([
            {
                time: 1,
                userStoryId: 1,
                threadId: 0,
                state: State.InProgress,
            },
            {
                time: 1,
                userStoryId: 1,
                threadId: 0,
                state: State.ToReview,
            },
            {
                time: 1,
                userStoryId: -1,
                threadId: 1,
                state: State.Done,
            },
            {
                time: 1,
                userStoryId: -1,
                threadId: 2,
                state: State.Done,
            },
            {
                time: 2,
                userStoryId: -1,
                threadId: 0,
                state: State.Done,
            },
            {
                time: 2,
                userStoryId: 1,
                threadId: 1,
                state: State.Review,
            },
            {
                time: 2,
                userStoryId: 1,
                threadId: 2,
                state: State.Review,
            },
            {
                time: 3,
                userStoryId: -1,
                threadId: 0,
                state: State.Done,
            },
            {
                time: 3,
                userStoryId: 1,
                threadId: 1,
                state: State.Review,
            },
            {
                time: 3,
                userStoryId: 1,
                threadId: 2,
                state: State.Review,
            },
            {
                time: 3,
                userStoryId: 1,
                threadId: 0,
                state: State.Done,
            },
        ]);

        expect(getUserStoriesDone(backlog)).toHaveLength(1);
        expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
    });

    test('should handle 3 simple userStories by 3 devs and 2 reviews', () => {
        const backlog = new Backlog([
            {
                id: 0,
                name: 'userStory0',
                complexity: 1,
                reviewComplexity: 1,
                review: {
                    reviewersNeeded: 2,
                    reviewers: new Map<number, number>(),
                },
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
            {
                id: 1,
                name: 'userStory1',
                complexity: 1,
                reviewComplexity: 1,
                review: {
                    reviewersNeeded: 2,
                    reviewers: new Map<number, number>(),
                },
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
            {
                id: 2,
                name: 'userStory2',
                complexity: 1,
                reviewComplexity: 1,
                review: {
                    reviewersNeeded: 2,
                    reviewers: new Map<number, number>(),
                },
                state: State.Todo,
                threadId: undefined,
                progression: 0,
            },
        ]);

        const team = new ParallelTeam([
            {id: 0, name: 'thread1', power: 1},
            {id: 1, name: 'thread2', power: 1},
            {id: 2, name: 'thread3', power: 1},
        ]);
        const events = simulate(backlog, team);
        expect(events).toEqual([
            {
                state: State.InProgress,
                threadId: 0,
                time: 1,
                userStoryId: 0,
            },
            {
                state: State.ToReview,
                threadId: 0,
                time: 1,
                userStoryId: 0,
            },
            {
                state: State.InProgress,
                threadId: 1,
                time: 1,
                userStoryId: 1,
            },
            {
                state: State.ToReview,
                threadId: 1,
                time: 1,
                userStoryId: 1,
            },
            {
                state: State.InProgress,
                threadId: 2,
                time: 1,
                userStoryId: 2,
            },
            {
                state: State.ToReview,
                threadId: 2,
                time: 1,
                userStoryId: 2,
            },
            {
                state: State.Review,
                threadId: 0,
                time: 2,
                userStoryId: 1,
            },
            {
                state: State.Review,
                threadId: 1,
                time: 2,
                userStoryId: 0,
            },
            {
                state: State.Review,
                threadId: 2,
                time: 2,
                userStoryId: 1,
            },
            {
                state: State.Done,
                threadId: 1,
                time: 2,
                userStoryId: 1,
            },
            {
                state: State.ToReview,
                threadId: 0,
                time: 2,
                userStoryId: 0,
            },
            {
                state: State.Review,
                threadId: 0,
                time: 3,
                userStoryId: 2,
            },
            {
                state: State.Review,
                threadId: 1,
                time: 3,
                userStoryId: 2,
            },
            {
                state: State.Done,
                threadId: 2,
                time: 3,
                userStoryId: 2,
            },
            {
                state: State.Review,
                threadId: 2,
                time: 3,
                userStoryId: 0,
            },
            {
                state: State.Done,
                threadId: 0,
                time: 3,
                userStoryId: 0,
            },
        ]);

        expect(getUserStoriesDone(backlog)).toHaveLength(3);
        expect(getUserStoriesRemainings(backlog)).toHaveLength(0);
    });
});
