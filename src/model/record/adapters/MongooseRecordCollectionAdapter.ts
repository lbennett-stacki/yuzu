import { RecordI, RecordCollectionI } from '../Record';

export class MongooseRecordCollectionAdapter<T>
  implements RecordCollectionI<T> {
  private records: RecordI<T>[];

  constructor(records: RecordI<T>[]) {
    this.records = records;
  }

  async save(): Promise<RecordCollectionI<T>> {
    await this.records.forEach(async (record: RecordI<T>) => {
      await record.save();
    });

    return new MongooseRecordCollectionAdapter<T>(this.records);
  }

  toObject(): T[] {
    return this.records.map((record: RecordI<T>) => record.toObject());
  }
}
