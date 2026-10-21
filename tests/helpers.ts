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

export const ADDRESS = {
  recipient_name: "Sok Dara",
  phone: "012345678",
  address_line: "St 271, Toul Kork",
  city: "Phnom Penh",
};

export const checkout = (token: string, paymentMethod: "cash_on_delivery" | "card" = "cash_on_delivery") =>
  api().post("/api/orders/checkout").set(auth(token)).send({ shippingAddress: ADDRESS, paymentMethod });

/**
 * Admin + category + one farmer with one product. Returns everyone's tokens.
 */
export const setupShop = async (stock = 5, price = 1.5) => {
  const admin = await createUserAndLogin("ADMIN");
  const farmer = await createUserAndLogin("FARMER");
  const customer = await createUserAndLogin("CUSTOMER");
  await api().post("/api/categories").set(auth(admin.token)).send({ name: "Vegetables" });
  const product = await api().post("/api/products").set(auth(farmer.token))
    .send({ product_name: "Carrot", product_des: "Organic", price, stock, category: "Vegetables" });
  return { admin, farmer, customer, productId: product.body.data._id as string };
};
