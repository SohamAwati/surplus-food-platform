import { getGlobalImpact, getDonorImpact, getNgoImpact, getVolunteerImpact } from "../services/impact/impact.service.js";

export async function getGlobalImpactController(req, res, next) {
  try {
    const impact = await getGlobalImpact();
    res.json({ success: true, data: impact });
  } catch (error) {
    next(error);
  }
}

export async function getMyImpactController(req, res, next) {
  try {
    const { role, id } = req.user;
    let impact;
    
    if (role === "DONOR") {
      impact = await getDonorImpact(id);
    } else if (role === "NGO") {
      impact = await getNgoImpact(id);
    } else if (role === "VOLUNTEER") {
      impact = await getVolunteerImpact(id);
    } else {
      impact = await getGlobalImpact();
    }

    res.json({ success: true, data: impact });
  } catch (error) {
    next(error);
  }
}
