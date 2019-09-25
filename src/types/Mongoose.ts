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
  unique?: boolean;
  default?: boolean;
  ref?: string;
}

export type SchemableOne<T> = SchemaConfig<T>;
export type SchemableMany<T> = SchemaConfig<T>[];

export declare type SchemableProp<T> = T extends object[]
  ? SchemableMany<TypeName<T>>
  : SchemableOne<TypeName<T>> | Schemable<T>;

export declare type Schemable<T> = {
  [P in keyof T]: SchemableProp<T[P]>;
};
