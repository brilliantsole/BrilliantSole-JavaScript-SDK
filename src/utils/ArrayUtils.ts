export function createArray(arrayLength: number, objectOrCallback: ((index: number) => any) | object) {
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

export function arrayWithoutDuplicates(array: any[]) {
  return array.filter((value, index) => array.indexOf(value) == index);
}
