import {State, UserStory} from "./user-story.ts";
import {noReview} from "./review.ts";

export const todo = (options :Partial<UserStory> = {}): UserStory => {
    return {
        id: 0,
        name: 'todo',
        complexity : 1,
        reviewComplexity: 1,
        review: noReview,
        state: State.Todo,
        threadId: undefined,
        progression: 0,
        ...options
    };
};

export const inProgress = (options : Partial<UserStory> = {}): UserStory => {
    return {
        id: 0,
        name: 'inProgress',
        complexity: 2,
        reviewComplexity: 1,
        review: noReview,
        state: State.InProgress,
        threadId: 0,
        progression: 0,
        ...options
    };
};

export const toReview = (options : Partial<UserStory> = {}): UserStory => {
    return {
        id: 0,
        name: 'toReview',
        complexity: 1,
        reviewComplexity : 1,
        review: noReview,
        state: State.ToReview,
        threadId: 0,
        progression: 0,
        ...options
    };
};

export const inReview = (
    options: Partial<UserStory> = {}
): UserStory => {
    return {
        id: 0,
        name: 'inReview',
        complexity: 4,
        reviewComplexity: 2,
        review: {
            reviewersNeeded: 2,
            reviewers: new Map(),
        },
        state: State.Review,
        threadId: 0,
        progression: 0,
        ...options
    };
};