import { ModelI, ModelConfigI } from '../model/Model';
import { Class } from '../types/Class';

export interface DatabaseI {
  init(): void;
  connect(connectionString: string): void;
  disconnect(): void;

  model(name: string): ModelI;
  registerModel(model: object, name: string): void;
}

export interface DatabaseConfigI {
  client: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  adapter: Class<DatabaseI>;
  connectionString: string;
  models: string[];
}

export abstract class Database implements DatabaseI {
  private models: Map<string, ModelI> = new Map();

  abstract init(): void;
  abstract connect(connectionString: string): void;
  abstract disconnect(): void;

  model(name: string): ModelI {
    return this.models.get(name);
  }

  abstract registerModel(model: ModelConfigI<any>): void;

  registerModelAdapter(model: ModelI, name: string): void {
    this.models.set(name, model);
  }
}
