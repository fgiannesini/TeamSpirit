import { describe, expect, it } from 'vitest';
import { Backlog } from './backlog.ts';
import { State } from './user-story.ts';
import { ParallelTeam } from './team.ts';
import { TimeEvent } from './events.ts';

describe('Parallel Team', () => {
  it('should handle 2 simple userStories by 2 devs', () => {
    const backlog = Backlog.init()
      .addUserStory({
        name: 'userStory2',
        complexity: 1,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .addUserStory({
        name: 'userStory1',
        complexity: 1,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .build();

    const events = ParallelTeam.init().withDevCount(2).build().run(backlog);

    expect(events).toEqual<TimeEvent[]>([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(2);
    expect(backlog.remainings()).toHaveLength(0);
  });

  it('should handle 3 simple userStories by 2 devs', () => {
    const backlog = Backlog.init()
      .addUserStory({
        name: 'userStory3',
        complexity: 1,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .addUserStory({
        name: 'userStory2',
        complexity: 1,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .addUserStory({
        name: 'userStory1',
        complexity: 1,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .build();

    const events = ParallelTeam.init().withDevCount(2).build().run(backlog);

    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'userStory3',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 2,
        userStoryName: 'userStory3',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'idle',
        thread: 1,
        state: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(3);
    expect(backlog.remainings()).toHaveLength(0);
  });

  it('should handle 2 complex userStories by 2 devs', () => {
    const backlog = Backlog.init()
      .addUserStory({
        name: 'userStory2',
        complexity: 2,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .addUserStory({
        name: 'userStory1',
        complexity: 2,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .build();

    const events = ParallelTeam.init().withDevCount(2).build().run(backlog);

    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.IN_PROGRESS,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.IN_PROGRESS,
      },
      {
        time: 2,
        userStoryName: 'userStory2',
        thread: 1,
        state: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(2);
    expect(backlog.remainings()).toHaveLength(0);
  });

  it('should handle 1 simple userStory and review', () => {
    const backlog = Backlog.init()
      .addUserStory({
        name: 'userStory1',
        complexity: 1,
        state: State.TODO,
        thread: -1,
        progression: 0,
      })
      .build();

    const events = ParallelTeam.init()
      .withDevCount(2)
      .withReview()
      .build()
      .run(backlog);

    expect(events).toEqual([
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.IN_PROGRESS,
      },
      {
        time: 1,
        userStoryName: 'userStory1',
        thread: 0,
        state: State.TO_REVIEW,
      },
      {
        time: 1,
        userStoryName: 'idle',
        thread: 1,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'idle',
        thread: 0,
        state: State.DONE,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.REVIEW,
      },
      {
        time: 2,
        userStoryName: 'userStory1',
        thread: 1,
        state: State.DONE,
      },
    ]);

    expect(backlog.dones()).toHaveLength(1);
    expect(backlog.remainings()).toHaveLength(0);
  });
});
