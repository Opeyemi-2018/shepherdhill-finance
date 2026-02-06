import z from "zod";

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, "email is required")
    .email("please enter a valid email"),
  password: z
    .string()
    .min(1, "password is required")
    .min(5, "password must be at least 5 characters"),
});

// Password Reset Request Schema (for email submission)
export const PasswordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, "email is required")
    .email("please enter a valid email"),
});

// Password Reset Confirm Schema (for new password submission)
export const PasswordResetConfirmSchema = z
  .object({
    password: z
      .string()
      .min(1, "password is required")
      .min(6, "password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordResetConfirmType = z.infer<
  typeof PasswordResetConfirmSchema
>;
export type PasswordResetRequestType = z.infer<
  typeof PasswordResetRequestSchema
>;
export type SignInType = z.infer<typeof SignInSchema>;
