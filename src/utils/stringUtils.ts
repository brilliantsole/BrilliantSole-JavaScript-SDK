import { removeRedundancies } from "./ObjectUtils.ts";

export function spacesToPascalCase(string: string) {
  return string
    .replace(/(?:^\w|\b\w)/g, function (match) {
      return match.toUpperCase();
    })
    .replace(/\s+/g, "");
}

export function capitalizeFirstCharacter(string: string) {
  return string[0].toUpperCase() + string.slice(1);
}

export function removeRedundantCharacters(string: string) {
  return removeRedundancies(Array.from(string)).join("");
}

export function removeSubstrings(string: string, substrings: string[]): string {
  let result = string;
  for (const sub of substrings) {
    result = result.split(sub).join("");
  }
  return result;
}
