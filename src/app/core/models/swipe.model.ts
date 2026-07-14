export type SwipeDirection = 'like' | 'dislike';

export interface Swipe {
  userId: string;
  eventId: string;
  direction: SwipeDirection;
  timestamp: string;
}
