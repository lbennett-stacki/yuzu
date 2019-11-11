import path from 'path';
import fs from 'fs';
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
  protected readonly config: DatabaseConfigI;
  static readonly VALID_MODEL_FILE_NAME_REGEX = /\.js$/;

  abstract init(): void;
  abstract connect(connectionString: string): void;
  abstract disconnect(): void;

  constructor(config: DatabaseConfigI) {
    this.config = config;
  }

  model(name: string): ModelI {
    return this.models.get(name);
  }

  abstract registerModel(model: ModelConfigI<any>): void; // eslint-disable-line @typescript-eslint/no-explicit-any

  registerModelAdapter(model: ModelI, name: string): void {
    this.models.set(name, model);
  }

  registerModels(): void {
    this.config.models.forEach((modelsPath: string) => {
      const modelsList: string[] = fs.readdirSync(modelsPath);

      modelsList.forEach((modelFileName: string) => {
        if (!Database.VALID_MODEL_FILE_NAME_REGEX.test(modelFileName)) return;

        const model = require(path.join(modelsPath, modelFileName)).default; // eslint-disable-line @typescript-eslint/no-var-requires
        if (model && model.name) this.registerModel(model);
      });
    });
  }
}
