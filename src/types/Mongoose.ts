import { Schema } from 'mongoose';

export type TypeName<T> = T extends string
  ? typeof String
  : T extends boolean
  ? typeof Boolean
  : T extends number
  ? typeof Number
  : T extends object
  ? typeof Schema.Types.Mixed
  : void;

export type Schemable<T> = {
  [P in keyof T]: {
    type: TypeName<T[P]>;
    required?: boolean;
    default?: boolean;
  };
};
