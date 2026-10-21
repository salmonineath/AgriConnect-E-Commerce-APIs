import { describe, expect, it } from "vitest";
import { api, auth, createUserAndLogin } from "./helpers";

describe("permissions", () => {
  it("blocks anonymous users from editing accounts", async () => {
    const { userId } = await createUserAndLogin("CUSTOMER");
    const res = await api().put(`/api/users/${userId}`).send({ full_name: "Hacked" });
    expect(res.status).toBe(401);
  });

  it("lets a user edit only their own profile, and never their password", async () => {
    const me = await createUserAndLogin("CUSTOMER");
    const other = await createUserAndLogin("CUSTOMER");

    const own = await api().put(`/api/users/${me.userId}`).set(auth(me.token)).send({ full_name: "New Name", password: "x" });
    expect(own.status).toBe(200);
    expect(own.body.data.full_name).toBe("New Name");

    const theirs = await api().put(`/api/users/${other.userId}`).set(auth(me.token)).send({ full_name: "Hacked" });
    expect(theirs.status).toBe(403);

    const onlyPassword = await api().put(`/api/users/${me.userId}`).set(auth(me.token)).send({ password: "x" });
    expect(onlyPassword.status).toBe(400);
  });

  it("only admins can create categories and roles", async () => {
    const customer = await createUserAndLogin("CUSTOMER");
    const admin = await createUserAndLogin("ADMIN");

    await api().post("/api/categories").send({ name: "Fruit" }).expect(401);
    await api().post("/api/categories").set(auth(customer.token)).send({ name: "Fruit" }).expect(403);
    await api().post("/api/categories").set(auth(admin.token)).send({ name: "Fruit", des: "Fresh" }).expect(201);
    await api().post("/api/roles").set(auth(customer.token)).send({ name: "HACKER" }).expect(403);
  });

  it("stops a farmer from editing another farmer's product", async () => {
    const admin = await createUserAndLogin("ADMIN");
    const farmerA = await createUserAndLogin("FARMER");
    const farmerB = await createUserAndLogin("FARMER");
    await api().post("/api/categories").set(auth(admin.token)).send({ name: "Fruit" });

    const created = await api().post("/api/products").set(auth(farmerA.token))
      .send({ product_name: "Mango", product_des: "Sweet", price: 2, stock: 5, category: "Fruit" });
    expect(created.status).toBe(201);
    const id = created.body.data._id;

    await api().put(`/api/products/${id}`).set(auth(farmerB.token)).send({ price: 0 }).expect(403);
    await api().put(`/api/products/${id}`).set(auth(farmerA.token)).send({ price: 3 }).expect(200);
    await api().delete(`/api/products/${id}`).set(auth(admin.token)).expect(200);
  });

  it("returns 404 (not 500) for a missing product and 400 for a bad id", async () => {
    await api().get("/api/products/000000000000000000000000").expect(404);
    await api().get("/api/products/not-an-id").expect(400);
  });
});
