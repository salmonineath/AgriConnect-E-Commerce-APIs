import { describe, expect, it } from "vitest";
import { api } from "./helpers";
import { seedRoles } from "@/scripts/seed-helpers";

const newUser = {
  full_name: "Test Customer",
  user_name: "tester",
  email: "tester@example.com",
  phone: "012345678",
  password: "Password123!",
};

const cookieValue = (cookies: string[], name: string) =>
  cookies.find((c) => c.startsWith(`${name}=`))?.split(";")[0];

describe("auth", () => {
  it("registers a customer without leaking the password hash", async () => {
    await seedRoles();
    const res = await api().post("/api/auth/register").send(newUser);

    expect(res.status).toBe(201);
    expect(res.body.roles).toEqual(["CUSTOMER"]);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.refreshToken).toBeUndefined();
  });

  it("rejects an invalid register payload with 400", async () => {
    await seedRoles();
    const res = await api().post("/api/auth/register").send({ ...newUser, password: "short" });
    expect(res.status).toBe(400);
  });

  it("gives the same error for unknown user and wrong password", async () => {
    await seedRoles();
    await api().post("/api/auth/register").send(newUser);

    const unknown = await api().post("/api/auth/login").send({ user_name: "nobody", password: "x" });
    const wrong = await api().post("/api/auth/login").send({ user_name: "tester", password: "wrong-password" });

    expect(unknown.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(unknown.body.message).toBe(wrong.body.message);
  });

  it("refreshes tokens, then rejects the refresh token after logout", async () => {
    await seedRoles();
    const login = await api().post("/api/auth/register").send(newUser);
    const refresh = cookieValue(login.get("Set-Cookie") ?? [], "refreshToken")!;

    const refreshed = await api().post("/api/auth/refresh").set("Cookie", refresh);
    expect(refreshed.status).toBe(200);
    const rotated = cookieValue(refreshed.get("Set-Cookie") ?? [], "refreshToken")!;

    await api().post("/api/auth/logout").set("Cookie", rotated).expect(200);
    const afterLogout = await api().post("/api/auth/refresh").set("Cookie", rotated);
    expect(afterLogout.status).toBe(401);
  });
});

describe("errors", () => {
  it("returns JSON 404 for unknown routes", async () => {
    const res = await api().get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "Route not found" });
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await api().post("/api/auth/login").set("Content-Type", "application/json").send("{bad");
    expect(res.status).toBe(400);
  });
});
