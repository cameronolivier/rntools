import * as SUT from "./templating.utils";
import { Token } from "./templating.utils";
describe("templating.utils", () => {
  describe("tokenize", () => {
    it("should handle no string", () => {
      // @ts-ignore - while we don't expect an empty string we should still handle it
      expect(SUT.tokenize()).toEqual([]);
    });
    it("should handle a string without any tags", () => {
      expect(SUT.tokenize("hello world")).toEqual([
        { type: "text", value: "hello world" },
      ]);
    });
    it("should handle a string with a single tag", () => {
      const str = "{b}hello world{/b}";
      const result = SUT.tokenize(str);
      expect(result).toEqual([
        { type: "open", value: "b" },
        { type: "text", value: "hello world" },
        { type: "close", value: "b" },
      ]);
    });
    it("should handle a string with initial text and a single tag", () => {
      const str = "hello {b}world{/b}";
      const result = SUT.tokenize(str);
      expect(result).toEqual([
        { type: "text", value: "hello " },
        { type: "open", value: "b" },
        { type: "text", value: "world" },
        { type: "close", value: "b" },
      ]);
    });
    it("should handle a string with multiple tags", () => {
      const str = "one {b}two {r}three{/r} four{/b} five";

      const result = SUT.tokenize(str);
      expect(result).toEqual([
        { type: "text", value: "one " },
        { type: "open", value: "b" },
        { type: "text", value: "two " },
        { type: "open", value: "r" },
        { type: "text", value: "three" },
        { type: "close", value: "r" },
        { type: "text", value: " four" },
        { type: "close", value: "b" },
        { type: "text", value: " five" },
      ]);
    });
  });
  describe("mergeAdjacentTextTokens", () => {
    it("should merge adjacent text tokens correctly", () => {
      const tokens[] = [
        { type: "text", value: "hello " },
        { type: "text", value: "world" },
        { type: "open", value: "b" },
        { type: "text", value: " this " },
        { type: "text", value: " is" },
        { type: "close", value: "b" },
        { type: "text", value: " a test" },
      ];

      const result = SUT.mergeAdjacentTextTokens(tokens);
      expect(result).toEqual([
        { type: "text", value: "hello world" },
        { type: "open", value: "b" },
        { type: "text", value: " this is" },
        { type: "close", value: "b" },
        { type: "text", value: " a test" },
      ]);
    });
  });
  describe.only("removeOrphanTokens", () => {
    it("should remove unmatched opening tokens", () => {
      const tokens = [
        { type: "text", value: "hello " },
        { type: "open", value: "b" },
        { type: "text", value: "world" },
      ];

      const result = SUT.removeOrphanTokens(tokens);

      expect(result).toEqual([{ type: "text", value: "hello world" }]);
    });

    it("should remove unmatched closing tokens", () => {
      const tokens = [
        { type: "text", value: "hello " },
        { type: "close", value: "b" },
        { type: "text", value: "world" },
      ];

      const result = SUT.removeOrphanTokens(tokens);

      expect(result).toEqual([{ type: "text", value: "hello world" }]);
    });

    it("should keep matched opening and closing tokens", () => {
      const tokens = [
        { type: "text", value: "hello " },
        { type: "open", value: "b" },
        { type: "text", value: "world" },
        { type: "close", value: "b" },
      ];

      const result = SUT.removeOrphanTokens(tokens);

      expect(result).toEqual(tokens);
    });

    it("should handle nested tokens correctly", () => {
      const tokens = [
        { type: "text", value: "a " },
        { type: "open", value: "b" },
        { type: "text", value: "b " },
        { type: "open", value: "c" },
        { type: "text", value: "c" },
        { type: "close", value: "c" },
        { type: "close", value: "b" },
        { type: "text", value: " d" },
      ];

      const result = SUT.removeOrphanTokens(tokens);

      expect(result).toEqual(tokens);
    });

    it("should handle incorrect nesting", () => {
      const tokens = [
        { type: "text", value: "one " },
        { type: "open", value: "b" },
        { type: "text", value: "two " },
        { type: "close", value: "r" },
        { type: "text", value: " three" },
      ];

      const result = SUT.removeOrphanTokens(tokens);

      expect(result).toEqual([{ type: "text", value: "one two three" }]);
    });

    it("should identify orphaned tokens correctly", () => {
      const tokens = SUT.tokenize(
        "start {b}hello {r}world{/r} orphaned {o}{/b} end",
      );
      const validatedTokens = SUT.removeOrphanTokens(tokens);
      expect(validatedTokens).not.toContainEqual({ type: "open", value: "o" });
      expect(validatedTokens).toContainEqual({ type: "open", value: "b" });
      expect(validatedTokens).toContainEqual({ type: "close", value: "/b" });
    });
    it("should handle mismatched tokens correctly", () => {
      const tokens = SUT.tokenize(
          "start {b}hello {r}world{/b} orphaned{/r} end",
      );
      const validatedTokens = SUT.removeOrphanTokens(tokens);
      expect(validatedTokens).not.toContainEqual({ type: "open", value: "o" });
      expect(validatedTokens).toContainEqual({ type: "open", value: "b" });
      expect(validatedTokens).toContainEqual({ type: "close", value: "/b" });
    });

  });
  describe("constructTree", () => {
    it("should handle an empty token list", () => {
      expect(SUT.constructTree([])).toEqual([[], 0]);
    });

    it("should process plain text tokens", () => {
      const tokens = [{ type: "text", value: "Hello, world!" }];
      expect(SUT.constructTree(tokens)).toEqual([["Hello, world!"], 1]);
    });

    it("should handle nested tags", () => {
      const tokens = [
        { type: "text", value: "one " },
        { type: "open", value: "b" },
        { type: "text", value: "two " },
        { type: "open", value: "r" },
        { type: "text", value: "three" },
        { type: "close", value: "r" },
        { type: "text", value: " four" },
        { type: "close", value: "b" },
        { type: "text", value: " five" },
      ];

      const result = SUT.constructTree(tokens);

      const tree = [
        "one ",
        {
          type: "b",
          content: ["two ", { type: "redStyle", content: ["three"] }, " four"],
        },
        " five",
      ];
      expect(result).toEqual([tree, 9]);
    });
  });
  describe("parse", () => {
    it("should correctly parseTemplateString a simple string", () => {
      const input = "hello {b}world{/b}";
      const result = SUT.parseTemplateString(input);
      expect(result).toEqual(["hello ", { type: "b", content: ["world"] }]);
    });

    it("should remove orphaned closing tags", () => {
      const input = "hello {b}world{/b}{/r}";
      const result = SUT.parseTemplateString(input);
      expect(result).toEqual(["hello ", { type: "b", content: ["world"] }]);
    });

    it("should remove orphaned opening tags", () => {
      const input = "hello {b}{r}world{/r}";
      const result = SUT.parseTemplateString(input);
      expect(result).toEqual(["hello ", { type: "r", content: ["world"] }]);
    });

    it("should handle nested tags and remove orphans", () => {
      const input = "start {b}hello {r}world{/r} orphaned {o}{/b} end";
      const result = SUT.parseTemplateString(input);
      expect(result).toEqual([
        "start ",
        {
          type: "b",
          content: ["hello ", { type: "r", content: ["world"] }, " orphaned "],
        },
        " end",
      ]);
    });

    it("should return an empty array if only orphan tokens are provided", () => {
      const input = "{b}{/r}{o}";
      const result = SUT.parseTemplateString(input);
      expect(result).toEqual([]);
    });

    it("should return the text only if only orphan tokens are provided", () => {
      const input = "{b}hello{/r} world test";
      const result = SUT.parseTemplateString(input);
      expect(result).toEqual(["hello world test"]);
    });

    it("should return an array with a single string if no tags are in the input", () => {
      const input = "hello world";
      const result = SUT.parseTemplateString(input);
      expect(result).toEqual(["hello world"]);
    });
  });
});
