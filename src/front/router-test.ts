import {createMemoryHistory, createRouter} from 'vue-router'
import {routes} from "./router.ts";

export function createTestRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes,
    })
}