import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const generateToken = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

// ✅ Normal Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Replace this with real DB validation
  if (email === "admin@gmail.com" && password === "123456") {
    const token = generateToken({
      id: 1,
      role: "admin",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.json({ message: "Login successful", role: "admin" });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

// ✅ Guest Login
router.post("/guest", (req, res) => {
  const token = generateToken({
    id: "guest",
    role: "guest",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.json({ message: "Guest login successful", role: "guest" });
});

// ✅ Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

export default router;