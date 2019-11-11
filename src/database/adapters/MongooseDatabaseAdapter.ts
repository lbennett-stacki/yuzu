import { Mongoose, SchemaDefinition } from 'mongoose';
import { Database, DatabaseConfigI } from '../Database';
import { ModelConfigI } from '../../model/Model';
import { MongooseModelRegistrar } from './MongooseModelRegistrar';

export class MongooseDatabaseAdapter extends Database {
  private readonly client: Mongoose;
  private readonly modelRegistrar: MongooseModelRegistrar;

  constructor(config: DatabaseConfigI) {
    super(config);

    this.client = config.client;
    this.modelRegistrar = new MongooseModelRegistrar(this.client);
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
    this.modelRegistrar.register(
      modelConfig,
      this.registerModelAdapter.bind(this)
    );
  }
}
