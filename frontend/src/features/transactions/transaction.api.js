import { api } from "../../services/api";

export async function getMyTransactions() {
  return api.get("/transactions/mine");
}

export async function getDonorTransactions() {
  return api.get("/transactions/donor");
}

export async function getMyTransaction(
  transactionId
) {
  return api.get(
    `/transactions/${transactionId}`
  );
}

export async function confirmPickup(
  transactionId
) {
  return api.post(
    `/transactions/${transactionId}/pickup`
  );
}

export async function confirmDelivery(
  transactionId
) {
  return api.post(
    `/transactions/${transactionId}/delivery`
  );
}

export async function submitProof(transactionId, formData) {
  return api.post(`/proofs/${transactionId}`, formData);
}

export async function acknowledgeProof(transactionId) {
  return api.post(`/proofs/${transactionId}/acknowledge`);
}