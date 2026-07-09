import { describe, it, expect } from "@jest/globals";
import {
  addReviewSchema,
  addToCartSchema,
  loginSchema,
  registerSchema,
  updateCartSchema,
} from "../validators/authSchemas.js";

const validObjectId = "507f1f77bcf86cd799439011";

const getErrorDetails = (schema, payload) => {
  const { error } = schema.validate(payload, { abortEarly: false });
  return error?.details.map(({ path, type, message }) => ({
    path: path.join("."),
    type,
    message,
  })) ?? [];
};

const getErrorMessages = (schema, payload) =>
  getErrorDetails(schema, payload).map(({ message }) => message);

const getErrorTypes = (schema, payload) =>
  getErrorDetails(schema, payload).map(({ path, type }) => ({ path, type }));

describe("registerSchema", () => {
  const validRegistration = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
  };

  it("accepts a valid registration payload", () => {
    const { error, value } = registerSchema.validate(validRegistration);
    expect(error).toBeUndefined();
    expect(value).toEqual(validRegistration);
  });

  it("accepts boundary values for name and password length", () => {
    const minimumPayload = { name: "Jon", email: "jon@example.com", password: "12345678" };
    const maximumPayload = { name: "A".repeat(30), email: "avery@example.com", password: "12345678" };
    expect(registerSchema.validate(minimumPayload).error).toBeUndefined();
    expect(registerSchema.validate(maximumPayload).error).toBeUndefined();
  });

  it("rejects missing required fields with custom messages", () => {
    expect(getErrorMessages(registerSchema, {})).toEqual([
      "Name is a required field",
      "Email is a required field",
      "Password is a required field",
    ]);
  });

  it("rejects empty strings and invalid formats", () => {
    const payload = { name: "", email: "not-an-email", password: "short" };
    expect(getErrorTypes(registerSchema, payload)).toEqual([
      { path: "name", type: "string.empty" },
      { path: "email", type: "string.email" },
      { path: "password", type: "string.min" },
    ]);
    expect(getErrorMessages(registerSchema, payload)).toEqual([
      "Name cannot be empty",
      "Please provide a valid email address",
      "Password must be at least 8 characters long",
    ]);
  });

  it("rejects empty email and password strings", () => {
    expect(getErrorTypes(registerSchema, { name: "Jane Doe", email: "", password: "" })).toEqual([
      { path: "email", type: "string.empty" },
      { path: "password", type: "string.empty" },
    ]);
  });

  it("rejects names outside the configured length boundaries", () => {
    expect(getErrorDetails(registerSchema, { ...validRegistration, name: "Al" })).toEqual([
      { path: "name", type: "string.min", message: "Name must be at least 3 characters" },
    ]);
    expect(getErrorTypes(registerSchema, { ...validRegistration, name: "A".repeat(31) })).toEqual([
      { path: "name", type: "string.max" },
    ]);
  });
});

describe("loginSchema", () => {
  it("accepts a valid login payload", () => {
    const payload = { email: "jane@example.com", password: "password123" };
    const { error, value } = loginSchema.validate(payload);
    expect(error).toBeUndefined();
    expect(value).toEqual(payload);
  });

  it("rejects missing required fields", () => {
    expect(getErrorDetails(loginSchema, {})).toEqual([
      { path: "email", type: "any.required", message: "Email is a required field" },
      { path: "password", type: "any.required", message: "\"password\" is required" },
    ]);
  });

  it("rejects invalid email and short password values", () => {
    const payload = { email: "invalid-email", password: "short" };
    expect(getErrorTypes(loginSchema, payload)).toEqual([
      { path: "email", type: "string.email" },
      { path: "password", type: "string.min" },
    ]);
    expect(getErrorMessages(loginSchema, payload)[0]).toBe("Please provide a valid email address");
  });

  it("rejects empty email and password strings", () => {
    expect(getErrorTypes(loginSchema, { email: "", password: "" })).toEqual([
      { path: "email", type: "string.empty" },
      { path: "password", type: "string.empty" },
    ]);
  });
});

describe("addToCartSchema", () => {
  it("accepts a valid cart item payload", () => {
    const payload = { itemId: validObjectId, size: "M" };
    const { error, value } = addToCartSchema.validate(payload);
    expect(error).toBeUndefined();
    expect(value).toEqual(payload);
  });

  it("rejects missing item and size fields with custom messages", () => {
    expect(getErrorMessages(addToCartSchema, {})).toEqual([
      "Item ID is required",
      "Size is required",
    ]);
  });

  it("rejects empty item and size values with custom messages", () => {
    expect(getErrorMessages(addToCartSchema, { itemId: "", size: "" })).toEqual([
      "Item ID cannot be empty",
      "Size cannot be empty",
    ]);
  });
});

describe("updateCartSchema", () => {
  const validUpdate = { itemId: validObjectId, size: "L", quantity: 1 };

  it("accepts valid quantity boundary values", () => {
    expect(updateCartSchema.validate(validUpdate).error).toBeUndefined();
    expect(updateCartSchema.validate({ ...validUpdate, quantity: 0 }).error).toBeUndefined();
  });

  it("rejects missing fields with custom messages", () => {
    expect(getErrorMessages(updateCartSchema, {})).toEqual([
      "Item ID is required",
      "Size is required",
      "Quantity is required",
    ]);
  });

  it("rejects invalid item, size, and quantity values", () => {
    expect(getErrorDetails(updateCartSchema, { itemId: "", size: "", quantity: -1 })).toEqual([
      { path: "itemId", type: "string.empty", message: "Item ID cannot be empty" },
      { path: "size", type: "string.empty", message: "Size cannot be empty" },
      { path: "quantity", type: "number.min", message: "Quantity must be at least 0" },
    ]);
  });

  it("rejects non-numeric and non-integer quantity values", () => {
    expect(getErrorDetails(updateCartSchema, { ...validUpdate, quantity: "many" })).toEqual([
      { path: "quantity", type: "number.base", message: "Quantity must be a number" },
    ]);
    expect(getErrorTypes(updateCartSchema, { ...validUpdate, quantity: 1.5 })).toEqual([
      { path: "quantity", type: "number.integer" },
    ]);
  });
});

describe("addReviewSchema", () => {
  const validReview = { productId: validObjectId, rating: 5, comment: "Great product" };

  it("accepts valid rating and comment boundary values", () => {
    expect(addReviewSchema.validate(validReview).error).toBeUndefined();
    expect(addReviewSchema.validate({ ...validReview, rating: 1, comment: "abc" }).error).toBeUndefined();
    expect(addReviewSchema.validate({ ...validReview, rating: 5, comment: "A".repeat(1000) }).error).toBeUndefined();
  });

  it("rejects missing fields with custom messages", () => {
    expect(getErrorMessages(addReviewSchema, {})).toEqual([
      "Product ID is required",
      "Rating is required",
      "Comment is required",
    ]);
  });

  it("rejects invalid ObjectIds and empty comments with custom messages", () => {
    expect(getErrorDetails(addReviewSchema, { productId: "not-a-valid-object-id", rating: 3, comment: "" })).toEqual([
      { path: "productId", type: "string.pattern.base", message: "Product ID must be a valid MongoDB ObjectId" },
      { path: "comment", type: "string.empty", message: "Comment cannot be empty" },
    ]);
  });

  it("rejects rating boundary violations and non-integer values", () => {
    expect(getErrorMessages(addReviewSchema, { ...validReview, rating: 0 })).toEqual(["Rating must be at least 1"]);
    expect(getErrorMessages(addReviewSchema, { ...validReview, rating: 6 })).toEqual(["Rating cannot exceed 5"]);
    expect(getErrorMessages(addReviewSchema, { ...validReview, rating: 3.5 })).toEqual(["Rating must be a whole number"]);
  });

  it("rejects comment length boundary violations after trimming", () => {
    expect(getErrorDetails(addReviewSchema, { ...validReview, comment: " ab " })).toEqual([
      { path: "comment", type: "string.min", message: "Comment must be at least 3 characters" },
    ]);
    expect(getErrorMessages(addReviewSchema, { ...validReview, comment: "A".repeat(1001) })).toEqual([
      "Comment cannot exceed 1000 characters",
    ]);
  });
});

