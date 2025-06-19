import type { TimeEvent } from '../../simulate/events.ts';
import type { StructureEvent } from '../../simulate/simulation-structure.ts';
import type { StatEvent } from '../../simulate/stats.ts';

export const loadTimeEvents = (key: string): TimeEvent[] =>
  JSON.parse(
    sessionStorage.getItem(`computation-${key}`) ?? '[]',
  ) as TimeEvent[];

export const saveTimeEvents = (timeEvents: TimeEvent[], key: string): void =>
  sessionStorage.setItem(`computation-${key}`, JSON.stringify(timeEvents));

export const loadStatEvents = (key: string): StatEvent[] =>
  JSON.parse(sessionStorage.getItem(`stats-${key}`) ?? '[]') as StatEvent[];

export const saveStatEvents = (statEvents: StatEvent[], key: string): void =>
  sessionStorage.setItem(`stats-${key}`, JSON.stringify(statEvents));

export const saveStructureEvents = (
  structureEvents: StructureEvent[],
  key: string,
): void =>
  sessionStorage.setItem(`structure-${key}`, JSON.stringify(structureEvents));

export const loadStructureEvents = (key: string): StructureEvent[] =>
  JSON.parse(
    sessionStorage.getItem(`structure-${key}`) ?? '[]',
  ) as StructureEvent[];
