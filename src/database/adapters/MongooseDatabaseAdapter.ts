import { Mongoose, Schema } from 'mongoose';
import { Database } from '../Database';
import { MongooseModelAdapter } from '../../model/adapters/MongooseModelAdapter';

export class MongooseDatabaseAdapter extends Database {
  private client: Mongoose;
  private readonly connectionString: string;

  constructor(client: Mongoose, connectionString: string) {
    super();

    this.client = client;
    this.connectionString = connectionString;
  }

  init(): void {
    this.connect();
  }

  connect(): void {
    this.client.connect(this.connectionString, { useNewUrlParser: true });
  }

  disconnect(): void {
    this.client.disconnect();
  }

  registerModel(model: Schema, name: string): void {
    this.client.model(name, model);
    this.registerModelAdapter(
      new MongooseModelAdapter(this.client.model(name)),
      name
    );
  }
}
