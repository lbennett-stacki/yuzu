import { Document } from 'mongoose';
import { RecordInterface } from '../Record';

export class MongooseRecordAdapter {
  private record: Document;

  constructor(record: Document) {
    this.record = record;
  }

  async save(): Promise<RecordInterface> {
    await this.record.save();
    return new MongooseRecordAdapter(this.record);
  }

  toPlain(): object {
    return this.record;
  }
}
