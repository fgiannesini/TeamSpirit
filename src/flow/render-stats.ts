import type { StatEvent } from '../simulate/stats.ts';

const getLeadTime = (): Element | null => {
  return document.querySelector('#lead-time');
};

const getTime = (): Element | null => {
  return document.querySelector('#time');
};

export const renderStatEvents = (
  events: StatEvent[],
  time: number,
  maxTime: number,
): void => {
  const currentEvents = events.filter((event) => event.time === time);
  if (currentEvents.length === 0) {
    return;
  }

  const leadTime = getLeadTime();
  if (leadTime) {
    leadTime.textContent = currentEvents[0].leadTime?.toFixed(2) ?? Number.NaN;
  }

  const timeElement = getTime();
  if (timeElement) {
    timeElement.textContent = `${currentEvents[0].time.toString()}/${maxTime}`;
  }
};
