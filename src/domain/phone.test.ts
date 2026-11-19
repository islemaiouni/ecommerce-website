import { describe, expect, it } from "vitest";
import { normalizeAlgerianPhone } from "./phone";

describe("normalizeAlgerianPhone", () => {
  it("accepts local mobile numbers", () => {
    expect(normalizeAlgerianPhone("0555123456")).toBe("0555123456");
  });

  it("normalizes +213 numbers", () => {
    expect(normalizeAlgerianPhone("+213555123456")).toBe("0555123456");
  });

  it("rejects invalid prefixes", () => {
    expect(normalizeAlgerianPhone("0445123456")).toBeNull();
  });
});
