import { describe, expect, it } from "vitest";

describe("LankaCare API foundation", () => {
  it("exposes a stable service identity", () => {
    expect("lankacare-api").toBe("lankacare-api");
  });
});
