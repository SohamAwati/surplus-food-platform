import { api } from "../../services/api";

export function getDonorProfile() {
  return api.get("/donor/profile");
}

export function updateDonorProfile(data) {
  return api.patch("/donor/profile", data);
}

export function getDonorOutlets() {
  return api.get("/donor/outlets");
}

export function createDonorOutlet(data) {
  return api.post("/donor/outlets", data);
}

export function getDonorOutlet(outletId) {
  return api.get(`/donor/outlets/${outletId}`);
}

export function updateDonorOutlet(outletId, data) {
  return api.patch(
    `/donor/outlets/${outletId}`,
    data
  );
}

export function deleteDonorOutlet(outletId) {
  return api.delete(
    `/donor/outlets/${outletId}`
  );
}