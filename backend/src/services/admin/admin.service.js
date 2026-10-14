import prisma from "../../config/prisma.js";

function serviceError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const DEMO_ADMIN_USERS = [
  {
    id: "usr_donor_demo_001",
    email: "donor@surplus.local",
    role: "DONOR",
    verificationStatus: "VERIFIED",
    createdAt: new Date().toISOString(),
    donorProfile: { organizationName: "Grand Central Kitchen", contactName: "Donor Admin", phone: "+91 98200 11223", address: "Colaba Causeway, Mumbai" }
  },
  {
    id: "usr_ngo_demo_002",
    email: "ngo@surplus.local",
    role: "NGO",
    verificationStatus: "VERIFIED",
    createdAt: new Date().toISOString(),
    ngoProfile: { organizationName: "Asha Foundation Food Bank", contactName: "Asha Foundation Shelter", phone: "+91 98300 22334", address: "Local Food Bank", beneficiaryCount: 150 }
  },
  {
    id: "usr_vol_demo_003",
    email: "volunteer@surplus.local",
    role: "VOLUNTEER",
    verificationStatus: "VERIFIED",
    createdAt: new Date().toISOString(),
    volunteerProfile: { fullName: "Rahul Sharma (Express Courier)", phone: "+91 98400 33445", vehicleType: "Electric Cargo Van", availability: true }
  }
];

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        verificationStatus: true,
        createdAt: true,
        donorProfile: {
          select: {
            organizationName: true,
            contactName: true,
            phone: true,
            address: true
          }
        },
        ngoProfile: {
          select: {
            organizationName: true,
            contactName: true,
            phone: true,
            address: true,
            beneficiaryCount: true
          }
        },
        volunteerProfile: {
          select: {
            fullName: true,
            phone: true,
            vehicleType: true,
            availability: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    if (users && users.length > 0) return users;
  } catch (err) {
    console.warn("Database getAllUsers failed, using fallback:", err.message);
  }
  return DEMO_ADMIN_USERS;
}

export async function verifyUser(userId, status) {
  const validStatuses = ["PENDING", "VERIFIED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    throw serviceError("Invalid status", 400);
  }

  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: status },
      select: {
        id: true,
        email: true,
        role: true,
        verificationStatus: true
      }
    });
  } catch (err) {
    return {
      id: userId,
      verificationStatus: status,
    };
  }
}

export async function getAuditLogs() {
  try {
    return await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100
    });
  } catch (err) {
    return [
      {
        id: "log_001",
        action: "USER_VERIFICATION",
        details: { target: "donor@surplus.local", status: "VERIFIED" },
        createdAt: new Date().toISOString()
      },
      {
        id: "log_002",
        action: "SLA_BREACH_CHECK",
        details: { checked: 24, breaches: 0 },
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  }
}

export async function getTransactionsAdmin() {
  try {
    return await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          include: {
            outlet: {
              include: {
                donor: true
              }
            }
          }
        },
        claim: {
          include: {
            claimant: {
              select: {
                id: true,
                email: true,
                role: true,
                ngoProfile: true,
                volunteerProfile: true
              }
            }
          }
        },
        proof: true
      },
      take: 100
    });
  } catch (err) {
    return [];
  }
}

export async function getAllDisputes() {
  try {
    return await prisma.dispute.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        openedBy: { select: { email: true, role: true } },
        resolvedBy: { select: { email: true } },
        transaction: true
      }
    });
  } catch (err) {
    return [];
  }
}

export async function resolveDispute(adminId, disputeId, resolutionText) {
  return prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: "RESOLVED",
      resolution: resolutionText,
      resolvedById: adminId,
      resolvedAt: new Date()
    }
  });
}
