import {
  idle,
  isInProgressBy,
  isInReviewBy,
  isToReviewBy,
  State,
  toDo,
  UserStory,
} from './user-story.ts';
import { Thread } from './team.ts';

class BacklogBuilder {
  private userStories: UserStory[] = [];
  public addUserStory = (userStory: UserStory): BacklogBuilder => {
    this.userStories.push(userStory);
    return this;
  };

  public build(): Backlog {
    return new Backlog(this.userStories);
  }
}

export class Backlog {
  private readonly _userStories: UserStory[];
  private _dones: UserStory[] = [];
  constructor(userStories: UserStory[]) {
    this._userStories = userStories;
  }

  public static init = (): BacklogBuilder => new BacklogBuilder();

  next(thread: Thread): UserStory {
    let threadUserStoryIndex = this._userStories.findIndex((userStory) =>
      isInProgressBy(userStory, thread),
    );

    if (threadUserStoryIndex == -1) {
      threadUserStoryIndex = this._userStories.findIndex((userStory) =>
        isInReviewBy(userStory, thread),
      );
    }

    if (threadUserStoryIndex == -1) {
      threadUserStoryIndex = this._userStories.findIndex((userStory) =>
        isToReviewBy(userStory, thread),
      );
    }

    if (threadUserStoryIndex == -1) {
      threadUserStoryIndex = this._userStories.findIndex((userStory) =>
        toDo(userStory),
      );
    }
    if (threadUserStoryIndex != -1) {
      return this._userStories.splice(threadUserStoryIndex, 1)[0];
    }
    return idle;
  }

  add(userStory: UserStory) {
    if (userStory.state == State.DONE) {
      this._dones.push(userStory);
    } else {
      this._userStories.push(userStory);
    }
  }

  dones(): UserStory[] {
    return this._dones;
  }

  remainings(): UserStory[] {
    return this._userStories;
  }

  hasMoreUserStories() {
    return this._userStories.length > 0;
  }
}
