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

  const data = await authService.login(email, password);

  res.json({ success: true, ...data });
};