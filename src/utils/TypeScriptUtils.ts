export type ValueOf<T> = T[keyof T];
export type KeyOf<T> = keyof T;

export type AddProperty<T, Key extends string, Value> = T & { [K in Key]: Value };
export type AddPropertyToInterfaceValues<Interface extends object, Key extends string, Value> = {
  [_ in keyof Interface]: AddProperty<Interface[_], Key, Value>;
};
export type AddKeysAsPropertyToInterface<Interface extends object, Key extends string> = {
  [Value in keyof Interface]: AddProperty<Interface[Value], Key, Value>;
};

export type ExtendInterfaceValues<Interface extends object, T> = {
  [Key in keyof Interface]: Interface[Key] & T;
};

export type CapitalizeFirstLetter<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${Uppercase<First>}${Rest}`
  : S;
export type AddPrefix<P extends string, S extends string> = `${P}${CapitalizeFirstLetter<S>}`;
export type AddPrefixToInterfaceKeys<Interface, P extends string> = {
  [Key in keyof Interface as `${AddPrefix<P, Key & string>}`]: Interface[Key];
};
