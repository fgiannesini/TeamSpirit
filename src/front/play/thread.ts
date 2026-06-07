export type ThreadState = 'Wait' | 'Develop' | 'Review';
export type ThreadPresence = '' | 'off';

export type UserStoryVue = {
  id: number;
  name: string;
  priority: number | null;
};

export type ThreadVue = {
  id: number;
  name: string;
  state: ThreadState;
  presence: ThreadPresence;
  inProgressStories: UserStoryVue[];
  reviewStories: UserStoryVue[];
};
