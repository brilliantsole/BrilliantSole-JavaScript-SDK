/**
 * @param {number} arrayLength
 * @param {((index:number) => any) | object} objectOrCallback
 */
export function createArray(arrayLength, objectOrCallback) {
    return new Array(arrayLength).fill(1).map((_, index) => {
        if (typeof objectOrCallback == "function") {
            const callback = objectOrCallback;
            return callback(index);
        } else {
            const object = objectOrCallback;
            return Object.assign({}, object);
        }
    });
}

/** @param {any[]} array */
export function arrayWithoutDuplicates(array) {
    return array.filter((value, index) => array.indexOf(value) == index);
}
