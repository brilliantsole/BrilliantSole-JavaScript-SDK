/**
 * made with ChatGPT
 * @param {string} string
 */
export function spacesToPascalCase(string) {
    return string
        .replace(/(?:^\w|\b\w)/g, function (match) {
            return match.toUpperCase();
        })
        .replace(/\s+/g, "");
}

/** @param {string} string */
export function capitalizeFirstCharacter(string) {
    return string[0].toUpperCase() + string.slice(1);
}
