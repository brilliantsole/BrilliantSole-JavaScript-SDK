export type ValueOf<T> = T[keyof T];

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

interface Acceleration {
  acceleration: boolean;
}

interface Gravity {
  gravity: number;
}

interface SensorMessages {
  acceleration: Acceleration;
  gravity: Gravity;
}

type Y = AddKeysAsPropertyToInterface<SensorMessages, "sensorType">;
