import { runSeed, seedUsersFromFile } from "./seed-helpers";

runSeed("Customers", () => seedUsersFromFile("customer.json", "CUSTOMER"));
