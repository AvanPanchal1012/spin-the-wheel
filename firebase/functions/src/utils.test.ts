import { pickWeightedIndex } from "./utils";

describe("pickWeightedIndex", () => {
  it("should favor higher weight segments", () => {
    const segments = [
      { label: "A", weight: 1, color: "#000" },
      { label: "B", weight: 9, color: "#111" },
    ];

    let countA = 0;
    let countB = 0;

    for (let i = 0; i < 1000; i++) {
      const idx = pickWeightedIndex(segments);
      if (segments[idx].label === "A") countA++;
      else countB++;
    }

    // Expect B to be chosen more often
    expect(countB).toBeGreaterThan(countA);
  });
});
