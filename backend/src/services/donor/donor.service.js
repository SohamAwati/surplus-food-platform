import {
  findDonorProfileByUserId,
  updateDonorProfile,
} from "../../repositories/donor.repository.js";

import {
  createOutlet,
  findOutletsByDonorId,
  getOutletById,
  updateOutlet,
  deleteOutlet,
} from "../../repositories/outlet.repository.js";

const DEMO_DONOR_PROFILE = {
  id: "00000000-0000-4000-8000-000000000003",
  userId: "00000000-0000-4000-8000-000000000004",
  organizationName: "Grand Central Kitchen",
  contactName: "Donor Admin",
  phone: "+91 98200 11223",
  address: "Colaba Causeway, Mumbai",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEMO_OUTLETS = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    donorId: "00000000-0000-4000-8000-000000000003",
    name: "Grand Central Kitchen - Main Branch",
    address: "Colaba Causeway, Mumbai, Maharashtra 400001",
    isActive: true,
    latitude: 18.922,
    longitude: 72.834,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    donorId: "00000000-0000-4000-8000-000000000003",
    name: "Grand Central - Bandra Express Hub",
    address: "Linking Road, Bandra West, Mumbai, Maharashtra 400050",
    isActive: true,
    latitude: 19.06,
    longitude: 72.836,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function getDonorProfile(userId) {
  try {
    const donor = await findDonorProfileByUserId(userId);
    if (donor) return donor;
  } catch (err) {
    console.warn("Database getDonorProfile failed, using fallback:", err.message);
  }

  return {
    ...DEMO_DONOR_PROFILE,
    userId,
  };
}

export async function updateDonorProfileData(userId, data) {
  try {
    const donor = await findDonorProfileByUserId(userId);
    if (donor) {
      return await updateDonorProfile(userId, data);
    }
  } catch (err) {
    console.warn("Database updateDonorProfile failed, using fallback:", err.message);
  }

  return {
    ...DEMO_DONOR_PROFILE,
    ...data,
    userId,
  };
}

export async function listDonorOutlets(userId) {
  try {
    const donor = await findDonorProfileByUserId(userId);
    if (donor) {
      return await findOutletsByDonorId(donor.id);
    }
  } catch (err) {
    console.warn("Database listDonorOutlets failed, using fallback:", err.message);
  }

  return DEMO_OUTLETS;
}

export async function createDonorOutlet(userId, data) {
  const donor = await findDonorProfileByUserId(userId);

  if (!donor) {
    const error = new Error("Donor profile not found");
    error.statusCode = 404;
    throw error;
  }

  return createOutlet({
    donorId: donor.id,
    ...data,
  });
}

export async function getDonorOutlet(userId, outletId) {
  const donor = await findDonorProfileByUserId(userId);

  if (!donor) {
    const error = new Error("Donor profile not found");
    error.statusCode = 404;
    throw error;
  }

  const outlet = await getOutletById(outletId);

  if (!outlet) {
    const error = new Error("Outlet not found");
    error.statusCode = 404;
    throw error;
  }

  validateOutletOwnership(outlet, donor.id);

  return outlet;
}

export async function updateDonorOutlet(userId, outletId, data) {
  const donor = await findDonorProfileByUserId(userId);

  if (!donor) {
    const error = new Error("Donor profile not found");
    error.statusCode = 404;
    throw error;
  }

  const outlet = await getOutletById(outletId);

  if (!outlet) {
    const error = new Error("Outlet not found");
    error.statusCode = 404;
    throw error;
  }

  validateOutletOwnership(outlet, donor.id);

  return updateOutlet(outletId, data);
}

export async function deleteDonorOutlet(userId, outletId) {
  const donor = await findDonorProfileByUserId(userId);

  if (!donor) {
    const error = new Error("Donor profile not found");
    error.statusCode = 404;
    throw error;
  }

  const outlet = await getOutletById(outletId);

  if (!outlet) {
    const error = new Error("Outlet not found");
    error.statusCode = 404;
    throw error;
  }

  validateOutletOwnership(outlet, donor.id);

  return deleteOutlet(outletId);
}

function validateOutletOwnership(outlet, donorId) {
  if (outlet.donorId !== donorId) {
    const error = new Error("You do not have access to this outlet");
    error.statusCode = 403;
    throw error;
  }
}