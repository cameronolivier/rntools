import * as SUT from "./templating.utils";
import { parseTokens } from "./templating.utils";
describe("Templating Utils", () => {
  // 1. need to break a string into command and text

  describe("parseTemplate", () => {
    it("should handle no input", () => {
      // given no text input
      const textToParse = undefined;
      // when parsed
      // @ts-ignore - ignoring as we need to be able to test no input being provided.
      const result = SUT.parseTemplate(textToParse);
      // then return an array
      expect(result).toEqual([]);
    });

    it("should handle a string with no commands", () => {
      // given text without any commands
      const textToParse = "a string";
      // when parsed
      const result = SUT.parseTemplate(textToParse);
      // then ...
      // ...return an array
      expect(Array.isArray(result)).toBe(true);
      // ... with a Token that contains the original text as the value
      expect(result[0]?.value).toBe(textToParse);
    });

    it("should extract a single command of format {command}...{/command} and the internal text from the string", () => {
      // given text with a command
      const textToParse = "{command}and some text{/command}";
      // when parsed
      const result = SUT.parseTemplate(textToParse, ["command"]);

      // then ...
      // ... expect the first element to be the command
      expect(result[0]).toEqual({
        type: "tag",
        value: "command",
        isClosingTag: false,
      });

      // ... expect the second element to be the internal text
      expect(result[1]).toEqual({ type: "text", value: "and some text" });
      // ... expect the third element to be the closing command
      expect(result[2]).toEqual({
        type: "tag",
        value: "command",
        isClosingTag: true,
      });
    });

    it("should extract multiple commands of format {command}...{/command} and the internal text from the string", () => {
      // given text with multiple commands
      const textToParse =
        "{command1}first text{/command1}{command2}second text{/command2}";

      // when parsed, with the accepted commands
      const result = SUT.parseTemplate(textToParse, ["command1", "command2"]);

      // then ...
      expect(result.length).toBe(6);
      // ... expect the first command to be in the format of [...command, text, command...]
      expect(result[0]?.value).toBe("command1");
      expect(result[1]?.value).toBe("first text");

      // ... expect the second command to be in the format of [...command, text, command...]
      expect(result[3]?.value).toBe("command2");
      expect(result[4]?.value).toBe("second text");
    });

    it("should correctly handle text outside commands", () => {
      // given text with content outside of the commands
      const textToParse =
        "I'm outside the command, {command1}first text{/command1}{command2}second text{/command2} and finally.";
      // when parsed, with the accepted commands
      const result = SUT.parseTemplate(textToParse, ["command1", "command2"]);

      // then ...
      // ... expect the first element to be the text before the first command
      expect(result[0]?.value).toBe("I'm outside the command, ");
      // ... expect the last element to text at after the last command
      expect(result[7]?.value).toBe(" and finally.");
      expect(result.length).toBe(8);
    });

    it("should only include accepted commands", () => {
      // given text with both accepted and unaccepted commands
      const textToParse =
        "{allowedCommand} text to parse{/allowedCommand}{disallowedCommand} more text{/disallowedCommand} end text";

      // when parsed, with the accepted commands
      const result = SUT.parseTemplate(textToParse, ["allowedCommand"]);

      // then ...
      // ... expect the accepted command to be included.
      expect(result[0]?.value).toBe("allowedCommand");
      // ... expect the unaccepted command to be ignored.
      expect(result[3]?.value).toBe(" more text");
    });

    it("should ignore whitespace for ignored commands", () => {
      // given text with whitespace before an unaccepted command
      const textToParse =
        "{allowedCommand} text to parse{/allowedCommand} {disallowedCommand} more text{/disallowedCommand} end text";

      // when parsed, with the accepted commands
      const result = SUT.parseTemplate(textToParse, ["allowedCommand"]);

      // then ...
      // ... expect the whitespace and the unaccepted command to be ignored.
      expect(result[3]?.value).toBe(" more text");
    });

    it("should handle nested commands", () => {
      // given text with nested commands
      const textToParse = "{bold}{red}text{/red}{/bold}";

      // when parsed, with the accepted commands
      const result = SUT.parseTemplate(textToParse, ["bold", "red"]);

      // then ...
      // ... expect the whitespace and the unaccepted command to be ignored.
      expect(result[0]?.value).toEqual("bold");
      expect(result[1]?.value).toEqual("red");
      expect(result[2]?.value).toEqual("text");
      expect(result[3]?.value).toEqual("red");
      expect(result[4]?.value).toEqual("bold");
    });
  });

  describe.only("parseTokens", () => {
    // want to recursively parse itself
    // either it's text - then return [undefined, text]
    // if tag = then return tag, and call

    it("should handle text", () => {
      const tokens = [{ type: "text", value: "text" }];
      const result = parseTokens(tokens);
      expect(result).toEqual([undefined, "text"]);
    });

    it("should handle a single tag", () => {
      const tokens = [{ type: "tag", value: "tag", isClosingTag: false }];
      const result = parseTokens(tokens);
      expect(result).toEqual(["tag-tag", undefined]);
    });
  });

  // should I be outputting a Map maybe? or List rather than an array?
  // 1.2 should merge all concurrent text tokens/nodes into a single text token/node
  // 2. map across all the tokens, calling the appropriate component:token fn to wrap the text.
  // 3. we need a command:function mapper to map the commands to the expected UI function.
  // 3. Return the formatted text either as an array or a string.
});
