import { ModelI } from '../model/Model';
import { Class } from '../types/Class';

export interface DatabaseI {
  init(): void;
  connect(connectionString: string): void;
  disconnect(): void;

  model(name: string): ModelI;
  registerModel(model: object, name: string): void;
}

export interface DatabaseConfigI {
  client: object;
  adapter: Class<DatabaseI>;
  connectionString: string;
  models: Function;
}

export abstract class Database implements DatabaseI {
  private models: Map<string, ModelI> = new Map();

  abstract init(): void;
  abstract connect(connectionString: string): void;
  abstract disconnect(): void;

  model(name: string): ModelI {
    return this.models.get(name);
  }

  abstract registerModel(model: object, name: string): void;

  registerModelAdapter(model: ModelI, name: string): void {
    this.models.set(name, model);
  }
}
