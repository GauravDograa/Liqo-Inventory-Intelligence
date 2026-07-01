import { Router, Response } from "express";
import jwt from "jsonwebtoken";
import { RetailEntityStatus, RetailLocationType, UserRole } from "@prisma/client";
import { authenticate } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../types/auth.types";
import { prisma } from "../../prisma/client";
import { warmAggregatedDashboardCache } from "../dashboard/dashboard.controller";
import { warmRecommendationsCache } from "../recommendation/recommendation.cache";

const router = Router();
const DEFAULT_ORGANIZATION_ID =
  process.env.DEFAULT_ORGANIZATION_ID || "seed-org-liqo-retail";
const jwtSecret =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV !== "production"
    ? "liqo-local-dev-secret"
    : undefined);

const generateToken = (payload: any) => {
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: "1d",
  });
};

const demoRoles: UserRole[] = [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.STORE_MANAGER,
  UserRole.CASHIER,
  UserRole.WAREHOUSE_MANAGER,
  UserRole.ANALYST,
];

const resolveRequestedRole = (value: unknown): UserRole => {
  return demoRoles.includes(value as UserRole) ? (value as UserRole) : UserRole.ADMIN;
};

const resolveAssignedStoreId = async (role: UserRole) => {
  if (role !== UserRole.STORE_MANAGER) {
    return undefined;
  }

  const store = await prisma.retailStore.findFirst({
    where: {
      organizationId: DEFAULT_ORGANIZATION_ID,
      locationType: RetailLocationType.STORE,
      status: RetailEntityStatus.ACTIVE,
      deletedAt: null,
    },
    select: { id: true },
  });

  return store?.id ?? null;
};

const issueSession = async (
  res: Response,
  userId: string,
  requestedRole: unknown
) => {
  const role = resolveRequestedRole(requestedRole);
  const assignedRetailStoreId = await resolveAssignedStoreId(role);

  const token = generateToken({
    userId,
    organizationId: DEFAULT_ORGANIZATION_ID,
    role,
    assignedRetailStoreId,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return role;
};

router.post("/login", async (req, res) => {
  const { email, password, role: requestedRole } = req.body;

  // Replace this with real DB validation.
  if (typeof email === "string" && email.endsWith("@gmail.com") && password === "123456") {
    const role = await issueSession(res, "local-demo-user", requestedRole);
    return res.json({ message: "Login successful", role });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

router.post("/guest", async (req, res) => {
  void warmAggregatedDashboardCache(DEFAULT_ORGANIZATION_ID);
  void warmRecommendationsCache(DEFAULT_ORGANIZATION_ID);

  const role = await issueSession(res, "biometric-demo-user", req.body?.role);
  res.json({ message: "Biometric login successful", role });
});

router.get("/session", authenticate, (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

export default router;
