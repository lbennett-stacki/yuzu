import { Document } from 'mongoose';
import { RecordInterface } from '../Record';

export class MongooseRecordAdapter<T> {
  private record: Document;

  constructor(record: Document) {
    this.record = record;
  }

  async save(): Promise<RecordInterface<T>> {
    await this.record.save();
    return new MongooseRecordAdapter<T>(this.record);
  }

  toObject(): T {
    return this.record.toObject();
  }
}
