export interface ApiReview {
  id:             number;
  nickname:       string;
  title:          string;
  detail:         string;
  rating:         number;
  createdAt:      string;
  helpfulCount:   number;
  userHasMarked:  boolean;
  ownerReply:     string | null;
  ownerReplyAt:   string | null;
}

export interface SubmitReviewBody {
  title:  string;
  detail: string;
  rating: number;
}
