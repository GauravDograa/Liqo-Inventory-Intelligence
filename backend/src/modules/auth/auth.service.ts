import { prisma } from "../../prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

const generateToken = (payload: {
  userId: string;
  organizationId: string;
  role: UserRole;
}) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

export const register = async (
  email: string,
  password: string,
  organizationName: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const organization = await prisma.organization.create({
    data: {
      name: organizationName,
    },
  });

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "OWNER",
      organizationId: organization.id,
    },
  });

  const token = generateToken({
    userId: user.id,
    organizationId: organization.id,
    role: user.role,
  });

  return { token };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateToken({
    userId: user.id,
    organizationId: user.organizationId!,
    role: user.role,
  });

  return { token };
};