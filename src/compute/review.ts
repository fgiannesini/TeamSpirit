import { Thread } from './team.ts';

export type Review = {
  reviewersNeeded: number;
  reviewers: Map<number, number>;
};
export const noReview: Review = {
  reviewersNeeded: 0,
  reviewers: new Map<number, number>(),
};
export const getReviewPoints = (review: Review, dev: Thread): number =>
  review.reviewers.get(dev.id) ?? 0;

export const needReview = (
  review: Review,
  dev: Thread,
  reviewComplexity: number
): boolean => {
  return (
    review.reviewersNeeded != review.reviewers.size ||
    review.reviewers.get(dev.id) != reviewComplexity
  );
};
export const hasAllReviews = (
  review: Review,
  reviewComplexity: number
): boolean =>
  review.reviewersNeeded == review.reviewers.size &&
  review.reviewers.values().every((review) => review == reviewComplexity);
