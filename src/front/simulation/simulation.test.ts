import {createTestingPinia} from '@pinia/testing';
import {shallowMount, type VueWrapper} from '@vue/test-utils';
import {describe, expect, test, vi} from 'vitest';
import {noBugGenerator} from '../../simulate/bug-generator.ts';
import {createBacklog, parallelTeam,} from '../../simulate/factory.ts';
import {noPriorityModificator} from '../../simulate/priority-modificator.ts';
import type {simulate} from '../../simulate/simulation.ts';
import {computeStatEvents} from '../../simulate/stats.ts';
import {noTeamModificator} from '../../simulate/team-modificator.ts';
import {type State, useFormStore} from '../form-store.ts';
import Resume from '../resume/resume.vue';
import Simulation from './simulation.vue';

describe('Simulation', () => {
    const createWrapper = (state: Partial<State> = {}): VueWrapper =>
        shallowMount(Simulation, {
            global: {
                plugins: [
                    createTestingPinia({
                        initialState: {
                            form: {...state},
                        },
                    }),
                ],
            },
        });

    test('Should render', () => {
        const wrapper = createWrapper();
        expect(wrapper.exists()).toBe(true);
    });

    describe('Resume', () => {
        test('Should render a resume panel', () => {
            const wrapper = createWrapper();
            expect(wrapper.get('[data-testid=resume-panel]').isVisible()).toBe(true);
        });

        test('Should render a resume component', () => {
            const wrapper = createWrapper();
            expect(wrapper.findComponent(Resume).isVisible()).toBe(true);
        });
    });

    describe('Launch', () => {
        const createWrapperWithMocks = () => {
            const {simulateMock, computeStatEventsMock} = vi.hoisted(() => ({
                simulateMock: vi.fn<typeof simulate>().mockReturnValue({
                    timeEvents: [],
                    structureEvents: [],
                }),
                computeStatEventsMock: vi.fn<typeof computeStatEvents>().mockReturnValue(
                    [{time: 2, leadTime: 0.5}]
                ),
            }));
            let wrapper = createWrapper();
                vi.mock('../../simulate/simulation.ts', () => ({
                    simulate: simulateMock,
                }));
                vi.mock('../../simulate/stats.ts', () => ({
                    computeStatEvents: computeStatEventsMock,
                }));
                useFormStore().toSimulationInputs = vi.fn().mockReturnValue([{
                    backlog: createBacklog(),
                    team: parallelTeam(),
                }])
            return {wrapper, simulateMock, computeStatEventsMock};
        }

        test('Should display a launch button', () => {
            const {wrapper} = createWrapperWithMocks()
            expect(wrapper.get('[data-testid=launch-button]').text()).toBe('Launch');
        });

        test('Should simulate on launch click', () => {
            const {wrapper, simulateMock} = createWrapperWithMocks();
            const launchButton = wrapper.get('[data-testid=launch-button]');
            launchButton.trigger('click');

            expect(simulateMock).toHaveBeenCalledWith(
                createBacklog(),
                parallelTeam(),
                noBugGenerator,
                noTeamModificator,
                noPriorityModificator,
            );
        });

        test('Should simulate stats on launch clic', () => {
            const {wrapper, computeStatEventsMock} = createWrapperWithMocks();
            const launchButton = wrapper.get('[data-testid=launch-button]');
            launchButton.trigger('click');
            expect(computeStatEventsMock).toHaveBeenCalledWith([]);
        });

        test('Should display stats container and header', () => {
            const {wrapper} = createWrapperWithMocks();
            const launchButton = wrapper.get('[data-testid=launch-button]');
            launchButton.trigger('click');
            expect(wrapper.find('[data-testid=stats-container]').exists()).toBe(true);
        })

        test('Should display stats total time', async () => {
            const {wrapper} = createWrapperWithMocks();
            const launchButton = wrapper.get('[data-testid=launch-button]');
            await launchButton.trigger('click');
            expect(wrapper.get('[data-testid=stats-total-time-header]').text()).toBe("Total time");
            expect(wrapper.get('[data-testid=stats-total-time-0]').text()).toBe("1");
        })

        test('Should display stats lead time', async () => {
            const {wrapper} = createWrapperWithMocks();
            const launchButton = wrapper.get('[data-testid=launch-button]');
            await launchButton.trigger('click');
            expect(wrapper.get('[data-testid=stats-lead-time-header]').text()).toBe("Lead time");
            expect(wrapper.get('[data-testid=stats-lead-time-0]').text()).toBe("0.5");
        })
    });
});
