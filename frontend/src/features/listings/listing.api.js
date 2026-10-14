import { api } from "../../services/api";

export function getMyListings() {
  return api.get("/listings/mine");
}

export function getMyListing(listingId) {
  return api.get(`/listings/mine/${listingId}`);
}

export function createListing(data) {
  return api.post("/listings", data);
}

export function updateListing(listingId, data) {
  return api.patch(
    `/listings/mine/${listingId}`,
    data
  );
}

export function cancelListing(listingId) {
  return api.post(
    `/listings/mine/${listingId}/cancel`
  );
}