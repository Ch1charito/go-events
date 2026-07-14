export interface GoUser {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
  /** Tag -> Gewichtung, wird aus Swipes berechnet (Matching) */
  tagScores: Record<string, number>;
}
