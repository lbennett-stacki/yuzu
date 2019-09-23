import { RecordI, RecordCollectionI, RecordCollection } from '../Record';

export class MongooseRecordCollectionAdapter<T> extends RecordCollection<T> {
  adapt(records: RecordI<T>[]): RecordCollectionI<T> {
    return new MongooseRecordCollectionAdapter(records);
  }
}
