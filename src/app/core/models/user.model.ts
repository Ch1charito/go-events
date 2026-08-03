export interface GoUser {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
  /** Tag -> Gewichtung, wird aus Swipes berechnet (Matching) */
  tagScores: Record<string, number>;
  /** Nur über Firebase Console setzbar (siehe Security Rules) */
  isAdmin?: boolean;
}
