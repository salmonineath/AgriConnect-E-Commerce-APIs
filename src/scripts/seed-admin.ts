import { runSeed, seedUser } from "./seed-helpers";

const REQUIRED_ENV = ["FULL_NAME_ADMIN", "USER_NAME_ADMIN", "EMAIL_ADMIN", "PHONE_ADMIN", "PASSWORD_ADMIN"];

runSeed("Admin", async () => {
    const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
    if (missing.length) {
        throw new Error(`Set these in .env first: ${missing.join(", ")}`);
    }

    const env = process.env as Record<string, string>;
    await seedUser(
        {
            full_name: env.FULL_NAME_ADMIN,
            user_name: env.USER_NAME_ADMIN,
            email: env.EMAIL_ADMIN,
            password: env.PASSWORD_ADMIN,
            phone: env.PHONE_ADMIN,
        },
        "ADMIN",
    );
});
