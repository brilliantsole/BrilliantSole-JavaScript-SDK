/**
 * made with ChatGPT
 * @param {string} string
 * @returns {string}
 */
export function spacesToPascalCase(string) {
    return string
        .replace(/(?:^\w|\b\w)/g, function (match) {
            return match.toUpperCase();
        })
        .replace(/\s+/g, "");
}
