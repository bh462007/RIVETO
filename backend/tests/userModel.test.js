import { describe, it, expect } from "@jest/globals";
import User from "../model/userModel.js";

describe("User model auth providers", () => {
  it("allows Google users without a password", async () => {
    const googleUser = new User({
      name: "Jane Doe",
      email: "jane.google@example.com",
      authProvider: "google",
    });

    await expect(googleUser.validate()).resolves.not.toThrow();
  });

  it("requires a password for local users", async () => {
    const localUser = new User({
      name: "Jane Doe",
      email: "jane.local@example.com",
    });

    await expect(localUser.validate()).rejects.toThrow(
      /Path `password` is required/,
    );
  });
});
