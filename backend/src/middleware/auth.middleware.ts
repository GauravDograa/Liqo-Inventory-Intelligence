import jwt from "jsonwebtoken";

export const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  const jwtSecret =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "liqo-local-dev-secret"
      : undefined);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
