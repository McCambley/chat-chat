/**
 * Parses a string for list items and adds a new line before each list item.
 *
 * @param input A string with list items indicated by numbers or dashes
 * @returns A string with each list item on a new line
 */
export default function transformList(input: string): string {
  const regex = /(-|\d+\.)\s(?=[^\n])/g;
  const formattedInput = input.replace(regex, "\n$&");
  return formattedInput;
}
