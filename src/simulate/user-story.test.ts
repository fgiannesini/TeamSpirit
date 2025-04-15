import {describe, expect, test} from "vitest"
import {inProgress, thread, todo} from "./factory.ts";
import {setInProgress} from "./user-story.ts";

describe("user-story", () => {
    test("should set in Progress", () => {
        const result = setInProgress(todo({complexity: 3, progression: 0}), thread({id: 0}));
        expect(result).toEqual(inProgress({complexity: 3, progression: 1, threadId: 0}));
    })

    test("should set in Progress with by an experimented thread", () => {
        const result = setInProgress(todo({complexity: 1, progression: 0}), thread({id: 0, power:3}));
        expect(result).toEqual(inProgress({complexity: 1, progression: 1, threadId: 0}));
    })
})