import { describe, expect, it } from "vitest";
import { api, auth, createUserAndLogin } from "./helpers";

const setupShop = async (stock = 5) => {
  const admin = await createUserAndLogin("ADMIN");
  const farmer = await createUserAndLogin("FARMER");
  const customer = await createUserAndLogin("CUSTOMER");
  await api().post("/api/categories").set(auth(admin.token)).send({ name: "Vegetables" });
  const product = await api().post("/api/products").set(auth(farmer.token))
    .send({ product_name: "Carrot", product_des: "Organic", price: 1.5, stock, category: "Vegetables" });
  return { admin, farmer, customer, productId: product.body.data._id as string };
};

describe("cart → checkout → orders", () => {
  it("customer can browse, add to cart, check out, and stock goes down", async () => {
    const { customer, productId } = await setupShop(5);

    const list = await api().get("/api/products");
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    await api().post("/api/cart/add").set(auth(customer.token)).send({ productId, quantity: 2 }).expect(200);
    await api().post("/api/cart/add").set(auth(customer.token)).send({ productId, quantity: 1 }).expect(200);
    const cart = await api().get("/api/cart").set(auth(customer.token));
    expect(cart.body.data.products[0].quantity).toBe(3);

    const order = await api().post("/api/orders/checkout").set(auth(customer.token));
    expect(order.status).toBe(201);
    expect(order.body.data.total).toBe(4.5);

    const product = await api().get(`/api/products/${productId}`);
    expect(product.body.data.stock).toBe(2);

    const emptyCart = await api().get("/api/cart").set(auth(customer.token));
    expect(emptyCart.body.data.products).toHaveLength(0);

    const mine = await api().get("/api/orders/me").set(auth(customer.token));
    expect(mine.body.data).toHaveLength(1);
  });

  it("cannot add more than the stock to the cart", async () => {
    const { customer, productId } = await setupShop(2);
    const res = await api().post("/api/cart/add").set(auth(customer.token)).send({ productId, quantity: 3 });
    expect(res.status).toBe(400);
  });

  it("checkout fails cleanly when stock ran out after adding to cart", async () => {
    const { farmer, customer, productId } = await setupShop(5);
    await api().post("/api/cart/add").set(auth(customer.token)).send({ productId, quantity: 4 });
    await api().put(`/api/products/${productId}`).set(auth(farmer.token)).send({ stock: 1 });

    const res = await api().post("/api/orders/checkout").set(auth(customer.token));
    expect(res.status).toBe(400);
    const product = await api().get(`/api/products/${productId}`);
    expect(product.body.data.stock).toBe(1);
  });

  it("empty cart checkout returns 400", async () => {
    const customer = await createUserAndLogin("CUSTOMER");
    await api().post("/api/orders/checkout").set(auth(customer.token)).expect(400);
  });

  it("cancelling an order returns the stock", async () => {
    const { customer, productId } = await setupShop(5);
    await api().post("/api/cart/add").set(auth(customer.token)).send({ productId, quantity: 2 });
    const order = await api().post("/api/orders/checkout").set(auth(customer.token));

    await api().patch(`/api/orders/${order.body.data.orderId}/cancel`).set(auth(customer.token)).expect(200);
    const product = await api().get(`/api/products/${productId}`);
    expect(product.body.data.stock).toBe(5);
  });

  it("only admin can see all orders and change status", async () => {
    const { admin, customer, productId } = await setupShop(5);
    await api().post("/api/cart/add").set(auth(customer.token)).send({ productId, quantity: 1 });
    const order = await api().post("/api/orders/checkout").set(auth(customer.token));
    const orderId = order.body.data.orderId;

    await api().get("/api/orders").set(auth(customer.token)).expect(403);
    await api().patch(`/api/orders/${orderId}/status`).set(auth(customer.token)).send({ status: "shipped" }).expect(403);

    await api().get("/api/orders").set(auth(admin.token)).expect(200);
    const shipped = await api().patch(`/api/orders/${orderId}/status`).set(auth(admin.token)).send({ status: "shipped" });
    expect(shipped.status).toBe(200);
    expect(shipped.body.data.status).toBe("shipped");

    await api().patch(`/api/orders/${orderId}/status`).set(auth(admin.token)).send({ status: "teleported" }).expect(400);
  });
});
