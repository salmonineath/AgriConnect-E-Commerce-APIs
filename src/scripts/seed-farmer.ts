import { runSeed, seedUsersFromFile } from "./seed-helpers";

runSeed("Farmers", () => seedUsersFromFile("farmer.json", "FARMER"));
