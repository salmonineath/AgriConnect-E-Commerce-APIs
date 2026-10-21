import request from "supertest";
import app from "@/app";
import { seedRoles, seedUser } from "@/scripts/seed-helpers";

export const api = () => request(app);

let counter = 0;

/**
 * Create a user with the given role and return their access token.
 */
export const createUserAndLogin = async (role: "ADMIN" | "FARMER" | "CUSTOMER") => {
  await seedRoles();
  counter += 1;
  const user = {
    full_name: `${role} User`,
    user_name: `${role.toLowerCase()}${counter}`,
    email: `${role.toLowerCase()}${counter}@example.com`,
    phone: "012345678",
    password: "Password123!",
  };
  await seedUser(user, role);

  const res = await api().post("/api/auth/login").send({ user_name: user.user_name, password: user.password });
  return { token: res.body.accessToken as string, userId: res.body.user._id as string };
};

export const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
