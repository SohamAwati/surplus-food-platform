import api from "../../services/api";

export async function getNeedZones() {
  const response = await api.get("/need-zones");
  return response.data || [];
}

export async function createNeedZone(data) {
  const response = await api.post("/need-zones", data);
  return response.data;
}

export async function getNearbyListings(lat, lng, radiusMeters = 10000) {
  const response = await api.get(`/need-zones/nearby-listings?lat=${lat}&lng=${lng}&radius=${radiusMeters}`);
  return response.data || [];
}
