/**
 *  Replaces punctuation keywords with their corresponding symbols
 *
 * @param input A strong created from spoken work that may contain punctuation keywords
 * @returns A string with punctuation keywords replaced with their corresponding symbols
 */
export default function transformPunctuation(input: string) {
  const replacements = [
    { keyword: "comma", symbol: "," },
    { keyword: "question mark", symbol: "?" },
    { keyword: "exclamation mark", symbol: "!" },
    { keyword: "period", symbol: "." },
    { keyword: "semicolon", symbol: ";" },
    { keyword: "colon", symbol: ":" },
    { keyword: "quotation mark", symbol: '"' },
    { keyword: "dash", symbol: "-" },
    { keyword: "dot dot dot", symbol: "..." },
    { keyword: "ellipsis", symbol: "..." },
  ];

  let newText = input;

  replacements.forEach((replacement) => {
    const regex = new RegExp(`\\b\${replacement.keyword}\\b`, "gi");
    newText = newText.replace(regex, replacement.symbol);
  });

  return newText;
}
