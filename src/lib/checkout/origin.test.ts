import { describe, expect, it } from "vitest";

import { isAllowedCheckoutOrigin } from "./origin";

describe("isAllowedCheckoutOrigin", () => {
  it("aanvaardt verzoeken zonder Origin-header", () => {
    expect(isAllowedCheckoutOrigin(null, "https://example.be", "http://internal:3000")).toBe(true);
  });

  it("aanvaardt exact de geconfigureerde publieke oorsprong", () => {
    expect(isAllowedCheckoutOrigin("https://example.be", "https://example.be", "http://internal:3000")).toBe(true);
  });

  it("behandelt localhost en 127.0.0.1 als dezelfde lokale oorsprong", () => {
    expect(isAllowedCheckoutOrigin("http://127.0.0.1:3000", "http://localhost:3000", "http://localhost:3000")).toBe(true);
  });

  it("weigert lokale adressen met een andere poort", () => {
    expect(isAllowedCheckoutOrigin("http://127.0.0.1:4000", "http://localhost:3000", "http://localhost:3000")).toBe(false);
  });

  it("weigert andere domeinen wanneer een publieke URL geconfigureerd is", () => {
    expect(isAllowedCheckoutOrigin("https://evil.example", "https://example.be", "http://internal:3000")).toBe(false);
  });
});
