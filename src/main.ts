import './style.scss';
import {saveStatEvents, saveStructureEvents, saveTimeEvents,} from './flow/storage/session-storage.ts';
import {generateDevForm, generateUserStoriesForm} from './form/form.ts';
import {Backlog} from './simulate/backlog.ts';
import {type BugGenerator, BugGeneratorHandler,} from './simulate/bug-generator.ts';
import {noReview} from './simulate/review.ts';
import {simulate} from './simulate/simulation.ts';
import {computeStatEvents} from './simulate/stats.ts';
import {EnsembleTeam, ParallelTeam, type Team, type Thread,} from './simulate/team.ts';
import {
    CustomTeamModificator,
    noTeamModificator,
    type TeamModificator,
    TeamModificatorHandler,
} from './simulate/team-modificator.ts';

const getInputValueOf = (selector: string): number => {
    const number = Number.parseInt(
        document.querySelector<HTMLInputElement>(selector)?.value ?? '1',
        10,
    );
    return Number.isNaN(number) ? 0 : number;
};

const runSimulation = (
    backlog: Backlog,
    team: Team,
    bugGenerator: BugGenerator,
    teamModificator: TeamModificator,
): string => {
    const {timeEvents, structureEvents} = simulate(
        backlog,
        team,
        bugGenerator,
        teamModificator,
    );
    const randomKey = crypto.randomUUID();
    saveTimeEvents(timeEvents, randomKey);
    saveStructureEvents(structureEvents, randomKey);
    const statEvents = computeStatEvents(timeEvents);
    saveStatEvents(statEvents, randomKey);
    return randomKey;
};

document.addEventListener('DOMContentLoaded', () => {
    document
        .querySelector<HTMLButtonElement>('#calculate-button')
        ?.addEventListener('click', () => {
            const ensembleTeamBacklog = buildBacklogForEnsembleTeam();

            const ensembleRandomKey = runSimulation(
                ensembleTeamBacklog,
                buildEnsembleTeam(),
                new BugGeneratorHandler(
                    () => Math.random(),
                    () => Math.random(),
                ),
                getTeamModificator(),
            );
            window.open(`/TeamSpirit/flow/flow.html?id=${ensembleRandomKey}`);
            window.open(
                `/TeamSpirit/time-sequence/time-sequence.html?id=${ensembleRandomKey}`,
            );
            const parallelTeamBacklog = buildBacklogForParallelTeam();
            const parallelRandomKey = runSimulation(
                parallelTeamBacklog,
                buildParallelTeam(),
                new BugGeneratorHandler(
                    () => Math.random(),
                    () => Math.random(),
                ),
                getTeamModificator(),
            );
            window.open(`/TeamSpirit/flow/flow.html?id=${parallelRandomKey}`);
            window.open(
                `/TeamSpirit/time-sequence/time-sequence.html?id=${parallelRandomKey}`,
            );
        });

    document
        .querySelector<HTMLButtonElement>('#generate-devs-button')
        ?.addEventListener('click', () => {
            const devsContainer = document.getElementById('devs-container');
            const devCount = getInputValueOf('#dev-count-input');
            const devs = Array.from({length: devCount}, (_, i) =>
                generateDevForm(i),
            );
            devsContainer?.replaceChildren(...devs);
        });

    document
        .querySelector<HTMLButtonElement>('#generate-user-stories-button')
        ?.addEventListener('click', () => {
            const userStoriesContainer = document.getElementById(
                'user-stories-container',
            );
            const userStoriesCount = getInputValueOf('#user-story-count-input');
            const userStories = Array.from({length: userStoriesCount}, (_, i) =>
                generateUserStoriesForm(i),
            );
            userStoriesContainer?.replaceChildren(...userStories);
        });

    document
        .querySelector<HTMLSelectElement>('#team-modificator')
        ?.addEventListener('change', (event) => {
            const target = event.target as HTMLSelectElement;
            if (target.value === 'custom') {
                const modificatorEventsDiv = document.querySelector<HTMLDivElement>(
                    '#team-modificator-events',
                );
                if (modificatorEventsDiv) {
                    modificatorEventsDiv.style.display = 'block';
                }
            } else {
                const modificatorEventsDiv = document.querySelector<HTMLDivElement>(
                    '#team-modificator-events',
                );
                if (modificatorEventsDiv) {
                    modificatorEventsDiv.style.display = 'none';
                }
            }
        });

    document
        .querySelector<HTMLSelectElement>('#team-modificator-events')
        ?.addEventListener('click', (event) => {
            let target = event.target as HTMLDivElement;
            target.parentElement?.append(document.createElement('div'));
        })
});

export const getTeamModificator = () => {
    const modificator =
        document.querySelector<HTMLSelectElement>('#team-modificator')?.value;
    if (modificator === 'random') {
        return new TeamModificatorHandler(() => Math.random());
    }
    if (modificator === 'custom') {
        return new CustomTeamModificator();
    }
    return noTeamModificator;
};

export const buildBacklogForParallelTeam = (): Backlog => {
    const userStoryCount = getInputValueOf('#user-story-count-input');
    return new Backlog(
        Array.from({length: userStoryCount}, (_, i) => ({
            id: i,
            name: `US${i}`,
            complexity: getInputValueOf(`#complexity-input-${i}`),
            review: {
                reviewers: new Map<number, number>(),
                reviewComplexity: getInputValueOf(`#review-complexity-input-${i}`),
            },
            state: 'Todo',
            threadId: undefined,
            progression: 0,
            timeDone: 0,
        })),
    );
};

export const buildBacklogForEnsembleTeam = (): Backlog => {
    const userStoryCount = getInputValueOf('#user-story-count-input');
    return new Backlog(
        Array.from({length: userStoryCount}, (_, i) => ({
            id: i,
            name: `US${i}`,
            complexity: getInputValueOf(`#complexity-input-${i}`),
            review: noReview,
            state: 'Todo',
            threadId: undefined,
            progression: 0,
            timeDone: 0,
        })),
    );
};

export const buildParallelTeam = (): Team => {
    const devCount = getInputValueOf('#dev-count-input');
    const reviewsCount = getInputValueOf('#reviewers-input');
    const threads: Thread[] = Array.from({length: devCount}, (_, i) => {
        return {
            id: i,
            name: `thread${i}`,
            power: getInputValueOf(`#power-input-${i}`),
            inTime: 0,
            offTime: 0,
            off: false,
        };
    });
    return new ParallelTeam(threads, reviewsCount);
};

export const buildEnsembleTeam = (): Team => {
    const devCount = getInputValueOf('#dev-count-input');
    const threads: Thread[] = Array.from({length: devCount}, (_, i) => {
        return {
            id: i,
            name: `thread${i}`,
            power: getInputValueOf(`#power-input-${i}`),
            inTime: 0,
            offTime: 0,
            off: false,
        };
    });
    return new EnsembleTeam(threads);
};
