import { describe, expect, it } from "vitest";
import { canTransition } from "./status-machine";

describe("canTransition", () => {
  it("allows the normal lifecycle", () => {
    expect(canTransition("new", "calling")).toBe(true);
    expect(canTransition("confirmed", "sent_to_delivery")).toBe(true);
  });

  it("rejects terminal-state transitions", () => {
    expect(canTransition("delivered", "new")).toBe(false);
    expect(canTransition("cancelled", "confirmed")).toBe(false);
  });
});
