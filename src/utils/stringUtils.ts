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
