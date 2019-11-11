import fs from 'fs';
import path from 'path';
import { Mongoose, Schema, SchemaDefinition, HookNextFunction } from 'mongoose';
import { Database, DatabaseConfigI } from '../Database';
import { ModelConfigI } from '../../model/Model';
import { MongooseModelAdapter } from '../../model/adapters/MongooseModelAdapter';

interface IndexedSchemaI extends Schema {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export class MongooseDatabaseAdapter extends Database {
  private readonly config: DatabaseConfigI;
  private readonly client: Mongoose;
  static readonly VALID_MODEL_FILE_NAME_REGEX = /\.js$/;

  constructor(config: DatabaseConfigI) {
    super();

    this.config = config;
    this.client = config.client;
  }

  init(): void {
    this.connect();
    this.registerModels();
  }

  connect(): void {
    this.client.connect(this.config.connectionString, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  }

  disconnect(): void {
    this.client.disconnect();
  }

  registerModel(modelConfig: ModelConfigI<SchemaDefinition>): void {
    const model: IndexedSchemaI = new Schema(
      modelConfig.model,
      modelConfig.options
    );

    if (modelConfig.hooks) {
      Object.entries(modelConfig.hooks).forEach(
        ([type, hooks]: [string, object]) => {
          Object.entries(hooks).forEach(([name, hook]: [string, Function]) => {
            model[type](name, function(next: HookNextFunction): void {
              hook(this).then(next);
            });
          });
        }
      );
    }

    if (modelConfig.methods) {
      Object.entries(modelConfig.methods).forEach(
        ([name, method]: [string, Function]) => {
          model.methods[name] = function(): void {
            method(this);
          };
        }
      );
    }

    this.client.model(modelConfig.name, model);
    this.registerModelAdapter(
      new MongooseModelAdapter(this.client.model(modelConfig.name)),
      modelConfig.name
    );
  }

  registerModels(): void {
    this.config.models.forEach((modelsPath: string) => {
      const modelsList: string[] = fs.readdirSync(modelsPath);

      modelsList.forEach((modelFileName: string) => {
        if (
          !MongooseDatabaseAdapter.VALID_MODEL_FILE_NAME_REGEX.test(
            modelFileName
          )
        )
          return;

        const model = require(path.join(modelsPath, modelFileName)).default; // eslint-disable-line @typescript-eslint/no-var-requires
        if (model && model.name) this.registerModel(model);
      });
    });
  }
}
