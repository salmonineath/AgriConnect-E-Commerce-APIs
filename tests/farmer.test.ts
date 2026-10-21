import { describe, expect, it } from "vitest";
import { api, auth, checkout, createUserAndLogin, setupShop } from "./helpers";

const addProduct = (token: string, name: string, price = 1) =>
  api().post("/api/products").set(auth(token))
    .send({ product_name: name, product_des: "Fresh", price, stock: 10, category: "Vegetables" });

describe("farmer dashboard", () => {
  it("lists only my own products", async () => {
    const { farmer } = await setupShop();
    const otherFarmer = await createUserAndLogin("FARMER");
    await addProduct(otherFarmer.token, "Cabbage");

    const mine = await api().get("/api/farmer/products").set(auth(farmer.token));
    expect(mine.status).toBe(200);
    expect(mine.body.data.map((p: { product_name: string }) => p.product_name)).toEqual(["Carrot"]);
    expect(mine.body.pagination.total).toBe(1);
  });

  it("is for farmers only", async () => {
    const { customer } = await setupShop();
    await api().get("/api/farmer/orders").set(auth(customer.token)).expect(403);
    await api().get("/api/farmer/products").expect(401);
  });

  it("shows farmers orders with only their own items", async () => {
    const { farmer, customer, productId } = await setupShop(10, 2);
    const otherFarmer = await createUserAndLogin("FARMER");
    const cabbage = await addProduct(otherFarmer.token, "Cabbage", 5);

    await api().post("/api/cart/add").set(auth(customer.token)).send({ productId, quantity: 3 });
    await api().post("/api/cart/add").set(auth(customer.token)).send({ productId: cabbage.body.data._id, quantity: 1 });
    await checkout(customer.token);

    const res = await api().get("/api/farmer/orders").set(auth(farmer.token));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    const order = res.body.data[0];
    expect(order.items).toHaveLength(1);
    expect(order.items[0].product_name).toBe("Carrot");
    expect(order.farmerSubtotal).toBe(6);
    expect(order.hasItemsFromOtherFarmers).toBe(true);
    expect(order.shippingAddress.city).toBe("Phnom Penh");

    // mixed order: farmer can't change it, admin must
    await api().patch(`/api/farmer/orders/${order._id}/status`).set(auth(farmer.token))
      .send({ status: "confirmed" }).expect(403);
  });

  it("lets a farmer fulfil an order made only of their products", async () => {
    const { farmer, customer, productId } = await setupShop();
    const otherFarmer = await createUserAndLogin("FARMER");
    await api().post("/api/cart/add").set(auth(customer.token)).send({ productId, quantity: 1 });
    const placed = await checkout(customer.token);
    const orderId = placed.body.data.orderId;

    for (const status of ["confirmed", "shipped", "delivered"]) {
      const res = await api().patch(`/api/farmer/orders/${orderId}/status`).set(auth(farmer.token)).send({ status });
      expect(res.status).toBe(200);
    }

    await api().patch(`/api/farmer/orders/${orderId}/status`).set(auth(otherFarmer.token))
      .send({ status: "cancelled" }).expect(403);
  });
});
