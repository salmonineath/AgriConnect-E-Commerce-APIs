import { beforeEach, describe, expect, it } from "vitest";
import { api, auth, createUserAndLogin } from "./helpers";

type Product = { product_name: string };
const names = (res: { body: { data: Product[] } }) => res.body.data.map((p) => p.product_name);

let farmerId: string;

beforeEach(async () => {
  const admin = await createUserAndLogin("ADMIN");
  const farmer = await createUserAndLogin("FARMER");
  farmerId = farmer.userId;
  await api().post("/api/categories").set(auth(admin.token)).send({ name: "Vegetables" });
  await api().post("/api/categories").set(auth(admin.token)).send({ name: "Fruit" });

  const products = [
    { product_name: "Carrot", product_des: "Organic orange carrot", price: 1, stock: 10, category: "Vegetables" },
    { product_name: "Mango", product_des: "Sweet Keo Romeat mango", price: 3, stock: 0, category: "Fruit" },
    { product_name: "Banana", product_des: "Local banana", price: 2, stock: 5, category: "Fruit" },
  ];
  for (const p of products) {
    await api().post("/api/products").set(auth(farmer.token)).send(p);
  }
});

describe("product search and filters", () => {
  it("searches name and description, case-insensitive", async () => {
    expect(names(await api().get("/api/products?search=MANGO"))).toEqual(["Mango"]);
    expect(names(await api().get("/api/products?search=organic"))).toEqual(["Carrot"]);
  });

  it("treats regex characters in search as plain text", async () => {
    const res = await api().get("/api/products?search=.*");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it("filters by category name, price range and stock", async () => {
    expect(names(await api().get("/api/products?category=fruit&sort=name"))).toEqual(["Banana", "Mango"]);
    expect(names(await api().get("/api/products?minPrice=2&maxPrice=3&sort=price_asc"))).toEqual(["Banana", "Mango"]);
    expect(names(await api().get("/api/products?category=Fruit&inStock=true"))).toEqual(["Banana"]);
    expect(names(await api().get("/api/products?category=NoSuchThing"))).toEqual([]);
    expect(names(await api().get(`/api/products?farmer=${farmerId}&sort=price_desc`))).toEqual(["Mango", "Banana", "Carrot"]);
  });

  it("paginates", async () => {
    const page1 = await api().get("/api/products?sort=name&limit=2&page=1");
    const page2 = await api().get("/api/products?sort=name&limit=2&page=2");
    expect(names(page1)).toEqual(["Banana", "Carrot"]);
    expect(names(page2)).toEqual(["Mango"]);
    expect(page1.body.pagination).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 });
  });

  it("rejects bad query values with 400", async () => {
    await api().get("/api/products?minPrice=abc").expect(400);
    await api().get("/api/products?minPrice=5&maxPrice=1").expect(400);
    await api().get("/api/products?sort=random").expect(400);
    await api().get("/api/products?page=0").expect(400);
  });
});
