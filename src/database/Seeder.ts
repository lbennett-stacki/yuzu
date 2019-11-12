import { DatabaseI } from './Database';

export abstract class Seeder {
  client: DatabaseI;

  constructor() {
    this.client = this.database();
  }

  init(): void {
    this.client.init();
  }

  async run(): Promise<void> {
    this.init();
    await this.seed();
    console.info(`${this.constructor.name} seeding complete`);
  }

  abstract seed(): Promise<void>;
  abstract database(): DatabaseI;
}
