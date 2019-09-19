import { Database as MongoritoDatabase, Model } from 'mongorito';
import { Class } from '../../types/Class';
import { Database } from '../Database';
import { MongoritoModelAdapter } from '../../model/adapters/MongoritoModelAdapter';

export class MongoritoDatabaseAdapter extends Database {
  private client: Class<MongoritoDatabase>;
  private connection: MongoritoDatabase;
  private readonly connectionString: string;

  constructor(client: Class<MongoritoDatabase>, connectionString: string) {
    super();

    this.client = client;
    this.connectionString = connectionString;
  }

  init(): void {
    this.connect();
  }

  connect(): void {
    this.connection = new this.client(this.connectionString);
    this.connection.connect();
  }

  disconnect(): void {
    this.connection.disconnect();
  }

  registerModel(model: Class<Model>, name: string): void {
    this.connection.register(model);
    super.registerModelAdapter(new MongoritoModelAdapter(model), name);
  }
}
