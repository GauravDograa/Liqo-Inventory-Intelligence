import { Router } from "express";
import jwt from "jsonwebtoken";
import { authenticate } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../types/auth.types";

const router = Router();
const DEFAULT_ORGANIZATION_ID =
  process.env.DEFAULT_ORGANIZATION_ID || "default-org-001";
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

// ✅ Normal Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Replace this with real DB validation
  if (email.endsWith("@gmail.com") && password === "123456") {
    const token = generateToken({
      userId: "local-admin",
      organizationId: DEFAULT_ORGANIZATION_ID,
      role: "ADMIN",
    });

    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ message: "Login successful", role: "admin" });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

// ✅ Guest Login
router.post("/guest", (req, res) => {
  const token = generateToken({
    userId: "guest-user",
    organizationId: DEFAULT_ORGANIZATION_ID,
    role: "USER",
  });

    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
  res.json({ message: "Guest login successful", role: "guest" });
});

router.get("/session", authenticate, (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

// ✅ Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

export default router;
