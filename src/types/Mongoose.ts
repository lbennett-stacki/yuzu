import { Schema } from 'mongoose';

export type TypeName<T> = T extends string
  ? typeof String
  : T extends boolean
  ? typeof Boolean
  : T extends number
  ? typeof Number
  : Schema | typeof Schema.Types.ObjectId;

export interface SchemaConfig<T> {
  type: T;
  required?: boolean;
  index?: boolean;
  unique?: boolean;
  default?: boolean | string | number;
  ref?: string;
}

export type SchemableProp<T> = T extends number | boolean | string
  ? SchemaConfig<TypeName<T>>
  : SchemaConfig<TypeName<T>> | Schemable<T>;

export type Schemable<T> = {
  [P in keyof T]: SchemableProp<T[P]>;
};
