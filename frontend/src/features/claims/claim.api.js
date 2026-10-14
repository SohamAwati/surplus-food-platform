import { api } from "../../services/api";

export async function getAvailableListings() {
  return api.get("/listings/available");
}

export async function createClaim(listingId, data = {}) {
  return api.post(`/claims/${listingId}/claim`, data);
}

export async function getMyClaims() {
  return api.get("/claims/mine");
}

export async function getMyClaim(claimId) {
  return api.get(`/claims/mine/${claimId}`);
}