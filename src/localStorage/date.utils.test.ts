import { formatDateWithDashes, formatWithMoment } from "./date.utils";

describe("formatDateWithDashes", () => {
  it("should return a date with dashes", () => {
    const date = "2022-11-9";
    const result = formatDateWithDashes(date);
    expect(result).toEqual("2022-11-09");
  });
});

describe("formatWithMoment", () => {
  it("should return a date with dashes", () => {
    const date = new Date("");
    const result = formatWithMoment(date.toString());
    expect(result).toEqual("2022-11-09");
  });
});
