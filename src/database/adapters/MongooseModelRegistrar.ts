import { Mongoose, Schema, SchemaDefinition, HookNextFunction } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { ModelConfigI } from '../../model/Model';
import { MongooseModelAdapter } from '../../model/adapters/MongooseModelAdapter';

interface IndexedSchemaI extends Schema {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export class MongooseModelRegistrar {
  private readonly client: Mongoose;

  constructor(client: Mongoose) {
    this.client = client;
  }

  register(
    modelConfig: ModelConfigI<SchemaDefinition>,
    registerMethod: Function
  ): void {
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

    if (modelConfig.virtuals) {
      Object.entries(modelConfig.virtuals).forEach(
        ([name, virtual]: [string, Function]) => {
          model.virtual(name).get(function(): void {
            virtual(this);
          });
        }
      );
    }

    if (modelConfig.options && modelConfig.options.paginate) {
      model.plugin(mongoosePaginate);
    }

    this.client.model(modelConfig.name, model);
    registerMethod(
      new MongooseModelAdapter(this.client.model(modelConfig.name)),
      modelConfig.name
    );
  }
}
