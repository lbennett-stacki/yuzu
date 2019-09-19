import { ModelInterface } from '../model/Model';
import { Class } from '../types/Class';

export interface DatabaseInterface {
  init(): void;
  connect(connectionString: string): void;
  disconnect(): void;

  model(name: string): ModelInterface;
  registerModel(model: object, name: string): void;
}

export interface DatabaseConfigInterface {
  client: object;
  adapter: Class<DatabaseInterface>;
  connectionString: string;
  models: Function;
}

export abstract class Database implements DatabaseInterface {
  private models: Map<string, ModelInterface> = new Map();

  abstract init(): void;
  abstract connect(connectionString: string): void;
  abstract disconnect(): void;

  model(name: string): ModelInterface {
    return this.models.get(name);
  }

  abstract registerModel(model: object, name: string): void;

  registerModelAdapter(model: ModelInterface, name: string): void {
    this.models.set(name, model);
  }
}
