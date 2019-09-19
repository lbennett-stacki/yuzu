import { Model } from 'mongorito';
import { RecordInterface } from '../Record';

export class MongoritoRecordAdapter implements RecordInterface {
  private record: Model;

  constructor(record: Model) {
    this.record = record;
  }

  async save(): Promise<RecordInterface> {
    await this.record.save();
    return new MongoritoRecordAdapter(this.record);
  }

  toPlain(): object {
    return this.record;
  }
}
