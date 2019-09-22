import { Document } from 'mongoose';
import { RecordI, Record } from '../Record';

interface DocumentIndexed extends Document {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any;
}

export class MongooseRecordAdapter<T> extends Record<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any;

  private record: DocumentIndexed;

  constructor(record: Document) {
    super(record);
  }

  async save(): Promise<RecordI<T>> {
    await this.record.save();

    return this;
  }

  toObject(): T {
    return this.record.toObject();
  }

  static create<T>(record: Document): MongooseRecordAdapter<T> {
    const mongooseRecord = new MongooseRecordAdapter<T>(record);

    return new Proxy(mongooseRecord, Record.proxyHandler());
  }
}
