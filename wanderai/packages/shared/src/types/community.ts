export type CommunityReview = {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  nationality: string;
  rating: number;
  text: string;
  photos: readonly string[];
  tags: readonly string[];
  createdAt: string;
};

export type CommunityFilters = {
  nationality?: string;
  foodCategory?: string;
  city?: string;
};
