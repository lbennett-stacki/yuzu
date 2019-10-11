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
    const record = await this.record.save();

    return MongooseRecordAdapter.create(record);
  }

  toObject(): T {
    return this.record.toObject();
  }

  load(relation: string): Promise<MongooseRecordAdapter<T>> {
    return this.record
      .populate(relation)
      .execPopulate()
      .then((record: Document) => MongooseRecordAdapter.create(record));
  }

  // TODO: document, unique to mongoose implementations
  markModified(path: string): void {
    this.record.markModified(path);
  }

  static create<T>(record: Document): MongooseRecordAdapter<T> {
    const mongooseRecord = new MongooseRecordAdapter<T>(record);

    return new Proxy(mongooseRecord, Record.proxyHandler());
  }
}
