import prisma from "../../config/prisma.js";
import { getNearbyListings } from "../need-zones/need-zone.service.js";

// Configurable weights
const WEIGHTS = {
  DISTANCE: 0.35,
  NEED_ZONE_PRIORITY: 0.25,
  AVAILABILITY: 0.20,
  SLA_FEASIBILITY: 0.10,
  RELIABILITY: 0.10
};

export async function getMatchedListingsForUser(userId, lat, lng, radiusMeters = 15000) {
  // 1. Get nearby listings using PostGIS
  const listings = await getNearbyListings(lat, lng, radiusMeters);

  if (!listings || listings.length === 0) {
    return [];
  }

  // 2. Fetch active need zones
  const needZones = await prisma.$queryRaw`
    SELECT id, priority, "radiusMeters",
           ST_X(location::geometry) AS lng,
           ST_Y(location::geometry) AS lat
    FROM need_zones
    WHERE "isActive" = true
  `;

  // 3. Fetch user historical data to calculate reliability (mocked/simplified for now)
  // E.g., user's past closed transactions vs expired claims
  const closedTx = await prisma.transaction.count({
    where: { claim: { claimantId: userId }, status: "CLOSED" }
  });
  
  // A simplistic reliability score between 0 and 1
  // Base 0.5, plus up to 0.5 based on successful deliveries
  const reliabilityScore = Math.min(1.0, 0.5 + (closedTx * 0.05));

  // SLA Feasibility Score: Based on distance (assume 30km/h average speed in city = ~500m/min)
  // Distance / 500 = minutes. Compare to SLA of 120 mins.
  const SLA_MINUTES = parseInt(process.env.SLA_DURATION_MINUTES || "120", 10);
  
  const scoredListings = listings.map(listing => {
    // a. Distance Score (0 to 1) - closer is better
    // If distance is > radius, score 0. If distance is 0, score 1.
    const distanceScore = Math.max(0, 1 - (listing.distanceMeters / radiusMeters));

    // b. Need Zone Priority (0 to 1)
    // Find if listing is in any need zone, take the highest priority
    let maxPriority = 0;
    for (const nz of needZones) {
      // Simplified check without postGIS for exact intersection per listing:
      // We can use a haversine approximation or just assume if it's within radius
      const d = getDistanceFromLatLonInMeters(listing.lat, listing.lng, nz.lat, nz.lng);
      if (d <= nz.radiusMeters) {
        if (nz.priority > maxPriority) {
          maxPriority = nz.priority;
        }
      }
    }
    // Assume max priority is 10
    const needZoneScore = Math.min(1.0, maxPriority / 10);

    // c. Availability Score
    // e.g. how urgently the food expires. Expires sooner = higher score needed.
    const now = new Date();
    const expiresAt = new Date(listing.expiresAt);
    const hoursLeft = (expiresAt - now) / (1000 * 60 * 60);
    // If < 2 hours, high priority. If > 24 hours, low priority.
    let availabilityScore = 1.0;
    if (hoursLeft > 24) availabilityScore = 0.2;
    else if (hoursLeft > 12) availabilityScore = 0.5;
    else if (hoursLeft > 2) availabilityScore = 0.8;

    // d. SLA Feasibility Score
    const estTravelTimeMins = listing.distanceMeters / 500; 
    let slaScore = 1.0;
    if (estTravelTimeMins > SLA_MINUTES) {
      slaScore = 0.0; // Impossible
    } else {
      slaScore = 1 - (estTravelTimeMins / SLA_MINUTES); // Faster = better
    }

    // e. Reliability (Same for all listings for this user)
    
    // Calculate total match score
    const totalScore = (
      (distanceScore * WEIGHTS.DISTANCE) +
      (needZoneScore * WEIGHTS.NEED_ZONE_PRIORITY) +
      (availabilityScore * WEIGHTS.AVAILABILITY) +
      (slaScore * WEIGHTS.SLA_FEASIBILITY) +
      (reliabilityScore * WEIGHTS.RELIABILITY)
    );

    return {
      ...listing,
      matchScore: Math.round(totalScore * 100) // Percentage
    };
  });

  // Sort by match score descending
  scoredListings.sort((a, b) => b.matchScore - a.matchScore);

  return scoredListings;
}

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
