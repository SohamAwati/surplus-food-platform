import { getMatchedListingsForUser } from "../services/matching/matching.service.js";

export async function getMatchedListingsController(req, res, next) {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "lat and lng required" });
    }

    const radiusMeters = radius ? parseInt(radius, 10) : 15000;
    
    const matched = await getMatchedListingsForUser(
      req.user.id,
      parseFloat(lat),
      parseFloat(lng),
      radiusMeters
    );

    res.json({ success: true, data: matched });
  } catch (error) {
    next(error);
  }
}
