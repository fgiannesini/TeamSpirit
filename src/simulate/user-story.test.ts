import {describe, expect, test} from "vitest"
import {done, inProgress, thread, todo, toReview} from "./factory.ts";
import {setDone, setDoneBy, setInProgress, setToReview} from "./user-story.ts";

describe("user-story", () => {
    test("should set in Progress", () => {
        const result = setInProgress(todo({complexity: 3, progression: 0}), thread({id: 0}));
        expect(result).toEqual(inProgress({complexity: 3, progression: 1, threadId: 0}));
    })

    test("should set in Progress with by an experimented thread", () => {
        const result = setInProgress(todo({complexity: 1, progression: 0}), thread({id: 0, power: 3}));
        expect(result).toEqual(inProgress({complexity: 1, progression: 1, threadId: 0}));
    })

    test("Should set Done", () => {
        const result = setDone(inProgress())
        expect(result).toEqual(done())
    })

    test("Should set Done By a specific thread", () => {
        const result = setDoneBy(inProgress(), 1)
        expect(result).toEqual(done({threadId: 1}))
    })

    test("Should set toReview", () => {
        const result = setToReview(inProgress({review: {reviewers: new Map(), reviewersNeeded: 1}}), 1)
        expect(result).toEqual(toReview({threadId: 1}))
    })
})