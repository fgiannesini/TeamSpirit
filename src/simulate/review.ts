import type {Thread} from './team.ts';

export interface Review {
  reviewersNeeded: number;
  reviewers: Map<number, number>;
}
export const noReview: Review = {
  reviewersNeeded: 0,
  reviewers: new Map<number, number>(),
};
export const getReviewPoints = (review: Review, dev: Thread): number =>
  review.reviewers.get(dev.id) ?? 0;

export const needReview = (
  review: Review,
  dev: Thread,
  reviewComplexity: number,
): boolean => {
  const { reviewers, reviewersNeeded } = review;
  const currentComplexity = reviewers.get(dev.id);
  const hasReviewed = reviewers.has(dev.id);
  const isFull = reviewers.size === reviewersNeeded;

  return !isFull
    ? !hasReviewed || currentComplexity !== reviewComplexity
    : hasReviewed && currentComplexity !== reviewComplexity;
};
export const hasAllReviews = (
  review: Review,
  reviewComplexity: number,
): boolean =>
  review.reviewersNeeded == review.reviewers.size &&
  review.reviewers.values().every((review) => review == reviewComplexity);

export const hasSomeReviews = (review: Review, reviewComplexity: number) => {
  return (
    review.reviewersNeeded != review.reviewers.size &&
    review.reviewers.values().every((review) => review == reviewComplexity)
  );
};
