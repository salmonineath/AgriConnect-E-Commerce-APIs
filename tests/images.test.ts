import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { api, auth, createUserAndLogin, setupShop } from "./helpers";
import { UPLOAD_ROOT } from "@/config/upload";

// Smallest valid PNG (1x1 pixel)
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

const upload = (token: string, productId: string, files: { name: string; content: Buffer; type: string }[]) => {
  let req = api().post(`/api/products/${productId}/images`).set(auth(token));
  for (const f of files) {
    req = req.attach("images", f.content, { filename: f.name, contentType: f.type });
  }
  return req;
};

const png = (name = "photo.png") => ({ name, content: PNG, type: "image/png" });

describe("product images", () => {
  it("uploads an image, serves it safely, and deletes it", async () => {
    const { farmer, productId } = await setupShop();

    const res = await upload(farmer.token, productId, [png()]);
    expect(res.status).toBe(201);
    const image = res.body.data.images[0];
    expect(image.url).toMatch(/^\/uploads\/products\/[0-9a-f-]+\.png$/);

    const served = await api().get(image.url);
    expect(served.status).toBe(200);
    expect(served.headers["content-type"]).toBe("image/png");
    expect(served.headers["x-content-type-options"]).toBe("nosniff");

    await api().delete(`/api/products/${productId}/images/${image._id}`).set(auth(farmer.token)).expect(200);
    expect(fs.existsSync(path.join(UPLOAD_ROOT, "products", image.filename))).toBe(false);
  });

  it("rejects non-images, even when renamed to .png", async () => {
    const { farmer, productId } = await setupShop();
    const dir = path.join(UPLOAD_ROOT, "products");
    const filesOnDisk = () => (fs.existsSync(dir) ? fs.readdirSync(dir).length : 0);
    const before = filesOnDisk();

    await upload(farmer.token, productId, [{ name: "x.txt", content: Buffer.from("hi"), type: "text/plain" }]).expect(400);

    const fake = await upload(farmer.token, productId, [{ name: "evil.png", content: Buffer.from("<script>alert(1)</script>"), type: "image/png" }]);
    expect(fake.status).toBe(400);
    // the rejected file must not be left on disk
    expect(filesOnDisk()).toBe(before);
  });

  it("enforces max 5 images and 2 MB per file", async () => {
    const { farmer, productId } = await setupShop();
    await upload(farmer.token, productId, [png(), png(), png()]).expect(201);
    await upload(farmer.token, productId, [png(), png(), png()]).expect(400);

    const big = Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024 + 1)]);
    const { productId: other, farmer: f2 } = await setupShopForAnotherFarmer();
    await upload(f2.token, other, [{ name: "big.png", content: big, type: "image/png" }]).expect(400);
  });

  it("only the owner farmer or an admin can upload", async () => {
    const { productId, customer } = await setupShop();
    const otherFarmer = await createUserAndLogin("FARMER");
    await upload(otherFarmer.token, productId, [png()]).expect(403);
    await upload(customer.token, productId, [png()]).expect(403);
  });

  it("deleting a product deletes its image files", async () => {
    const { farmer, productId } = await setupShop();
    const res = await upload(farmer.token, productId, [png()]);
    const file = path.join(UPLOAD_ROOT, "products", res.body.data.images[0].filename);
    expect(fs.existsSync(file)).toBe(true);

    await api().delete(`/api/products/${productId}`).set(auth(farmer.token)).expect(200);
    expect(fs.existsSync(file)).toBe(false);
  });
});

// setupShop creates a "Vegetables" category, so the second shop reuses it
async function setupShopForAnotherFarmer() {
  const farmer = await createUserAndLogin("FARMER");
  const product = await api().post("/api/products").set(auth(farmer.token))
    .send({ product_name: "Pumpkin", product_des: "Big", price: 4, stock: 2, category: "Vegetables" });
  return { farmer, productId: product.body.data._id as string };
}
