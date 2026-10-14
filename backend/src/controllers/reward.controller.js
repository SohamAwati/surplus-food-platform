import { getMyRewards } from "../services/rewards/reward.api.service.js";

export async function getMyRewardsController(req, res, next) {
  try {
    const rewards = await getMyRewards(req.user.id);
    res.json({ success: true, data: rewards });
  } catch (error) {
    next(error);
  }
}
