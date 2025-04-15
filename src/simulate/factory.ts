import {State, UserStory} from "./user-story.ts";
import {noReview} from "./review.ts";

export const todo = (options :Partial<UserStory>): UserStory => {
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

export const inProgress = (options : Partial<UserStory>): UserStory => {
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