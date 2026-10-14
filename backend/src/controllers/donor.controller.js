import {
  getDonorProfile,
  updateDonorProfileData,
  listDonorOutlets,
  createDonorOutlet,
  getDonorOutlet,
  updateDonorOutlet,
  deleteDonorOutlet,
} from "../services/donor/donor.service.js";

import {
  updateDonorProfileSchema,
  createOutletSchema,
  updateOutletSchema,
} from "../validators/donor.validator.js";

export async function getProfile(req, res, next) {
  try {
    const profile = await getDonorProfile(req.user.id);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const data = updateDonorProfileSchema.parse(req.body);

    const profile = await updateDonorProfileData(
      req.user.id,
      data
    );

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOutlets(req, res, next) {
  try {
    const outlets = await listDonorOutlets(req.user.id);

    res.json({
      success: true,
      data: outlets,
    });
  } catch (error) {
    next(error);
  }
}

export async function createOutletHandler(req, res, next) {
  try {
    const data = createOutletSchema.parse(req.body);

    const outlet = await createDonorOutlet(
      req.user.id,
      data
    );

    res.status(201).json({
      success: true,
      data: outlet,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOutlet(req, res, next) {
  try {
    const outlet = await getDonorOutlet(
      req.user.id,
      req.params.outletId
    );

    res.json({
      success: true,
      data: outlet,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOutletHandler(req, res, next) {
  try {
    const data = updateOutletSchema.parse(req.body);

    const outlet = await updateDonorOutlet(
      req.user.id,
      req.params.outletId,
      data
    );

    res.json({
      success: true,
      data: outlet,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOutletHandler(req, res, next) {
  try {
    await deleteDonorOutlet(
      req.user.id,
      req.params.outletId
    );

    res.json({
      success: true,
      message: "Outlet deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}