import { ReactNode } from "react";

export const TEMPLATE_TAGS = {
  DANGER: "dangerStyle",
  WARNING: "warningStyle",
  SUCCESS: "successStyle",
  BOLD: "boldStyle",
  ITALIC: "italicStyle",
} as const;

export type TemplateTags = (typeof TEMPLATE_TAGS)[keyof typeof TEMPLATE_TAGS];

const tagRegex = /\{\/?[a-zA-Z0-9]+}/g;

type TagToken = {
  type: "tag";
  isClosingTag: boolean;
  value: string;
  id: string;
};

type TextToken = {
  type: "text";
  value: string;
  id: string;
};

export type Token = TagToken | TextToken;

export type ParsedTemplateReturn = (Token | null)[];
export const parseTemplate = (
  text: string,
  acceptedCommands = Object.values(TEMPLATE_TAGS) as string[],
): ParsedTemplateReturn => {
  if (text === undefined) {
    return [];
  }

  const matches = Array.from(text.matchAll(tagRegex));

  if (!matches.length) {
    return [{ type: "text", value: text, id: "txt1" }];
  }

  const tokens: Token[] = matches.reduce((acc, match, index) => {
    const start =
      index === 0
        ? 0
        : (matches[index - 1]?.index || 0) + matches[index - 1][0].length;
    const end = match.index;

    const beforeTagText = text.slice(start, end);
    if (beforeTagText.trim().length) {
      const beforeTag: TextToken = {
        type: "text",
        value: beforeTagText,
        id: `txt${index}`,
      };
      acc.push(beforeTag);
    }

    const tagText = match[0].replace(/[{}\/]/g, "");
    const isAcceptedCommand = acceptedCommands.includes(tagText);

    if (isAcceptedCommand) {
      const isClosingTag = match[0].startsWith("{/");
      acc.push({
        type: "tag",
        isClosingTag,
        value: tagText,
        id: `tag${index}`,
      });
    }
    return acc;
  }, [] as Token[]);

  const afterLastTagText = text.slice(
    matches[matches.length - 1]?.index! + matches[matches.length - 1][0].length,
  );

  if (afterLastTagText) {
    const afterLastTag: TextToken = {
      id: "txtLast",
      type: "text",
      value: afterLastTagText,
    };
    tokens.push(afterLastTag);
  }

  return tokens;
};

// const tagComponents = {
//   [TEMPLATE_TAGS.DANGER]: (txt: string) => <Text>{txt}</Text>,
//   [TEMPLATE_TAGS.WARNING]: (txt: string) => `tag-${txt}`,
//   [TEMPLATE_TAGS.SUCCESS]: (txt: string) => `tag-${txt}`,
//   [TEMPLATE_TAGS.BOLD]: (txt: string) => `tag-${txt}`,
//   [TEMPLATE_TAGS.ITALIC]: (txt: string) => `tag-${txt}`,
// };

type RedTuple = [[string | undefined, string | RedTuple]];
type Results = { content: RedTuple; position: number };
export const parseTokens = (tokens: Token[]) => {
  const reducer = (acc: Results, token: Token, index: number) => {
    if (token.type === "text") {
      acc.content.push([undefined, token.value]);
      acc.position++;
      return acc;
    }

    if (token.type === "tag" && token.isClosingTag) {
      acc.position++;
      return acc;
    }

    const content = parseTokens(internalTokens);
  };

  const result: Results = tokens.reduce(reducer, { content: [], position: 0 });
  return [result.content, result.position];
};
