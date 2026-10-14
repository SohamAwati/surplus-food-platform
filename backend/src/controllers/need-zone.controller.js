import { createNeedZone, getNeedZones, getNearbyListings } from "../services/need-zones/need-zone.service.js";

export async function createNeedZoneController(req, res, next) {
  try {
    const { name, description, priority, radiusMeters, lat, lng } = req.body;
    
    if (lat == null || lng == null) {
      return res.status(400).json({ success: false, message: "lat and lng are required" });
    }

    const zone = await createNeedZone(req.user.id, req.user.role, {
      name, description, priority, radiusMeters, lat, lng
    });

    res.status(201).json({ success: true, data: zone });
  } catch (error) {
    next(error);
  }
}

export async function getNeedZonesController(req, res, next) {
  try {
    const zones = await getNeedZones();
    res.json({ success: true, data: zones });
  } catch (error) {
    next(error);
  }
}

export async function getNearbyListingsController(req, res, next) {
  try {
    const { lat, lng, radius } = req.query;
    
    if (lat == null || lng == null) {
      return res.status(400).json({ success: false, message: "lat and lng are required query params" });
    }

    const radiusMeters = radius ? parseInt(radius, 10) : 10000;

    const listings = await getNearbyListings(parseFloat(lat), parseFloat(lng), radiusMeters);

    res.json({ success: true, data: listings });
  } catch (error) {
    next(error);
  }
}
