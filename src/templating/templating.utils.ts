export const TEMPLATE_TAGS = {
  DANGER: "dangerStyle",
  WARNING: "warningStyle",
  SUCCESS: "successStyle",
  BOLD: "boldStyle",
  ITALIC: "italicStyle",
} as const;

export type TokenType = { type: "text" | "open" | "close"; value: string };
export type TreeType =
  | { type: string; content: (string | TreeType)[] }
  | string;

export function tokenize(str: string): TokenType[] {
  const regex = /\{\/?[a-zA-Z]+}/g;
  const tokens: TokenType[] = [];
  let lastIndex = 0;

  if (!str) {
    return [];
  }

  Array.from(str.matchAll(regex)).forEach((match) => {
    if (match.index !== lastIndex) {
      tokens.push({
        type: "text",
        value: str.slice(lastIndex, match.index),
      });
    }

    const tag = match[0].slice(1, -1);
    if (tag.startsWith("/")) {
      tokens.push({ type: "close", value: tag.slice(1) });
    } else {
      tokens.push({ type: "open", value: tag });
    }

    lastIndex = (match.index || 0) + match[0].length;
  });

  if (lastIndex !== str.length) {
    tokens.push({ type: "text", value: str.slice(lastIndex) });
  }

  return tokens;
}

export function mergeAdjacentTextTokens(tokens: TokenType[]): TokenType[] {
  const mergedTokens: TokenType[] = [];
  let currentText = "";

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];

    if (token.type === "text") {
      currentText += token.value;

      // Check if next token is also text and adjust for double spaces
      if (index < tokens.length - 1 && tokens[index + 1].type === "text") {
        if (
          currentText.endsWith(" ") &&
          tokens[index + 1].value.startsWith(" ")
        ) {
          currentText = currentText.trimEnd();
        }
      }
    }

    // If current token is not text or it's the last token in the list
    if (token.type !== "text" || index === tokens.length - 1) {
      if (currentText) {
        mergedTokens.push({ type: "text", value: currentText });
        currentText = "";
      }
      if (token.type !== "text") {
        mergedTokens.push(token);
      }
    }
  }

  return mergedTokens;
}

export function removeOrphanTokens(tokens: TokenType[]): TokenType[] {
  const stack: { token: TokenType; index: number }[] = [];
  const unmatchedOpens: number[] = [];
  const orphans: number[] = [];

  tokens.forEach((token, index) => {
    if (token.type === "open") {
      stack.push({ token, index });
      unmatchedOpens.push(index); // Add to unmatched opens here
    } else if (token.type === "close") {
      // Check for a matching open token in the stack
      let foundMatch = false;
      while (stack.length > 0) {
        const top = stack.pop();
        if (top!.token.value === token.value) {
          console.log("Match found for", token.value, "at index", index);
          foundMatch = true;
          const idx = unmatchedOpens.indexOf(top!.index);
          if (idx !== -1) unmatchedOpens.splice(idx, 1);
          break;
        }
      }

      if (!foundMatch) {
        orphans.push(index);
      }
    }
  });

  // Add truly unmatched opening tokens to the orphan list
  orphans.push(...unmatchedOpens);

  console.log("Stack:", stack);
  console.log("Unmatched Opens:", unmatchedOpens);
  console.log("Orphans:", orphans);

  const finalTokens: TokenType[] = [];
  tokens.forEach((token, index) => {
    // If the token is not an orphan, add it to the final output
    if (!orphans.includes(index)) {
      finalTokens.push(token);
    } else if (token.type === "text") {
      // If the token is an orphaned text token, concatenate it to the previous token (if it's also a text token)
      if (
        finalTokens.length &&
        finalTokens[finalTokens.length - 1].type === "text"
      ) {
        finalTokens[finalTokens.length - 1].value += token.value;
      } else {
        finalTokens.push(token);
      }
    }
  });

  // Filter out the orphan tokens
  let filteredTokens = tokens.filter((_, index) => !orphans.includes(index));

  return mergeAdjacentTextTokens(filteredTokens);
}

export function constructTree(tokens: TokenType[]): [TreeType[], number] {
  const content: TreeType[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === "text") {
      content.push(token.value);
      i++;
    } else if (token.type === "open") {
      const [nestedContent, consumed] = constructTree(tokens.slice(i + 1));
      content.push({ type: token.value, content: nestedContent });
      i += consumed + 2; // +1 for open tag, +1 for close tag
    } else if (token.type === "close") {
      break;
    }
  }

  return [content, i];
}

export function parse(str: string): TreeType[] {
  const tokens = tokenize(str);
  const validatedTokens = removeOrphanTokens(tokens);
  const [tree] = constructTree(validatedTokens);
  return tree;
}
