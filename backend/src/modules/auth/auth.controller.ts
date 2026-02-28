import { Request, Response } from "express";
import * as authService from "./auth.service";



export const register = async (req: Request, res: Response) => {
  const { email, password, organizationName } = req.body;

  const data = await authService.register(
    email,
    password,
    organizationName
  );

  res.json({ success: true, ...data });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { token } = await authService.login(email, password);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  res.json({ success: true });
};