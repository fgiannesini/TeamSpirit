﻿﻿import type { Thread } from './team.ts';

export type Review = {
  reviewComplexity: number;
  reviewersNeeded: number;
  reviewers: Map<number, number>;
};
export const noReview: Review = {
  reviewComplexity: 1,
  reviewersNeeded: 0,
  reviewers: new Map<number, number>(),
};
export const getReviewPoints = (review: Review, dev: Thread): number =>
  review.reviewers.get(dev.id) ?? 0;

export const canReview = (review: Review, dev: Thread): boolean => {
  const { reviewers, reviewersNeeded } = review;
  return reviewers.size !== reviewersNeeded && !reviewers.has(dev.id);
};

export const hasReviewStarted = (
  review: Review,
  thread: Thread,
  reviewComplexity: number,
): boolean => {
  const reviewers = review.reviewers;
  const currentComplexity = reviewers.get(thread.id);
  const hasReviewed = reviewers.has(thread.id);
  return hasReviewed && currentComplexity !== reviewComplexity;
};

export const hasAllReviews = (
  review: Review,
  reviewComplexity: number,
): boolean =>
  review.reviewersNeeded === review.reviewers.size &&
  review.reviewers
    .values()
    .every((reviewValue) => reviewValue === reviewComplexity);

export const hasSomeReviews = (
  review: Review,
  reviewComplexity: number,
): boolean => {
  return (
    review.reviewersNeeded !== review.reviewers.size &&
    review.reviewers
      .values()
      .every((reviewValue) => reviewValue === reviewComplexity)
  );
};
