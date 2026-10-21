import { describe, expect, it } from "vitest";
import { api, auth, checkout, setupShop } from "./helpers";

const placeOrder = async (paymentMethod: "card" | "cash_on_delivery") => {
  const shop = await setupShop(5, 2);
  await api().post("/api/cart/add").set(auth(shop.customer.token)).send({ productId: shop.productId, quantity: 2 });
  const order = await checkout(shop.customer.token, paymentMethod);
  return { ...shop, orderId: order.body.data.orderId as string };
};

const pay = (token: string, orderId: string, paymentToken: string) =>
  api().post(`/api/orders/${orderId}/pay`).set(auth(token)).send({ paymentToken });

const setStatus = (token: string, orderId: string, status: string) =>
  api().patch(`/api/orders/${orderId}/status`).set(auth(token)).send({ status });

describe("payment (simulated)", () => {
  it("approves tok_success and records the transaction", async () => {
    const { customer, orderId } = await placeOrder("card");

    const res = await pay(customer.token, orderId, "tok_success");
    expect(res.status).toBe(200);
    expect(res.body.data.payment.status).toBe("paid");
    expect(res.body.data.payment.transactionId).toMatch(/^sim_/);

    // can't pay twice
    await pay(customer.token, orderId, "tok_success").expect(400);
  });

  it("returns 402 for a declined card and leaves the order unpaid", async () => {
    const { customer, orderId } = await placeOrder("card");

    await pay(customer.token, orderId, "tok_declined").expect(402);
    const mine = await api().get("/api/orders/me").set(auth(customer.token));
    expect(mine.body.data[0].payment.status).toBe("unpaid");
  });

  it("rejects unknown tokens and other people's orders", async () => {
    const { customer, admin, orderId } = await placeOrder("card");
    await pay(customer.token, orderId, "4242424242424242").expect(400);
    await pay(admin.token, orderId, "tok_success").expect(404);
  });

  it("card orders can't be confirmed until paid", async () => {
    const { customer, admin, orderId } = await placeOrder("card");
    await setStatus(admin.token, orderId, "confirmed").expect(400);
    await pay(customer.token, orderId, "tok_success").expect(200);
    await setStatus(admin.token, orderId, "confirmed").expect(200);
  });

  it("cancelling a paid card order refunds it", async () => {
    const { customer, admin, orderId } = await placeOrder("card");
    await pay(customer.token, orderId, "tok_success");
    const res = await setStatus(admin.token, orderId, "cancelled");
    expect(res.body.data.payment.status).toBe("refunded");
  });

  it("cash on delivery: no online payment, marked paid on delivery", async () => {
    const { customer, admin, orderId } = await placeOrder("cash_on_delivery");
    await pay(customer.token, orderId, "tok_success").expect(400);

    await setStatus(admin.token, orderId, "confirmed").expect(200);
    await setStatus(admin.token, orderId, "shipped").expect(200);
    const delivered = await setStatus(admin.token, orderId, "delivered");
    expect(delivered.body.data.payment.status).toBe("paid");

    // delivered is final
    await setStatus(admin.token, orderId, "cancelled").expect(400);
  });
});
