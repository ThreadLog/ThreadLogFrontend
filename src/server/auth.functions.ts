import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const employeeSchema = z.object({
  role: z.literal("employee"),
  companyName: z.string().min(1).max(120),
  fullName: z.string().min(1).max(120),
  email: z.string().email().max(255),
  phone: z.string().min(4).max(40),
  password: z.string().min(8).max(200),
  companyCode: z.string().min(3).max(64),
});

const adminSchema = z.object({
  role: z.literal("admin"),
  companyName: z.string().min(1).max(120),
  organizationNumber: z.string().min(3).max(40),
  description: z.string().min(1).max(1000),
  companyPhone: z.string().min(4).max(40),
  companyEmail: z.string().email().max(255),
  password: z.string().min(8).max(200),
});

const registerSchema = z.discriminatedUnion("role", [employeeSchema, adminSchema]);

export const registerUser = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => registerSchema.parse(input))
  .handler(async ({ data }) => {
    // TODO: backend team — wire to real DB / invite-code validation here.
    console.log("[registerUser stub]", data.role, data.role === "employee" ? data.email : data.companyEmail);
    return { ok: true as const, role: data.role, userId: "stub-user-id" };
  });

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
});

export const loginUser = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => loginSchema.parse(input))
  .handler(async ({ data }) => {
    // TODO: backend team — verify credentials here.
    console.log("[loginUser stub]", data.email);
    return { ok: true as const, userId: "stub-user-id" };
  });
