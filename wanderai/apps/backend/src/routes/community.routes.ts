import { Router } from 'express';
import {
  getCommunityFeed,
  postCommunityReview,
  postFollowTraveler,
} from '../controllers/community.controller.js';

export const communityRouter = Router();

communityRouter.get('/', getCommunityFeed);
communityRouter.post('/reviews', postCommunityReview);
communityRouter.post('/follow', postFollowTraveler);
