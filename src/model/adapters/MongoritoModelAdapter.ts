import { Model } from 'mongorito';
import { ModelInterface, ModelFindConfig } from '../Model';
import { RecordInterface } from '../record/Record';
import { Class } from '../../types/Class';
import { MongoritoRecordAdapter } from '../record/adapters/MongoritoRecordAdapter';

export interface StaticModel extends Class<Model> {
  find(where: object): Model[];
  sort(sort: object): Model[];
}

export class MongoritoModelAdapter implements ModelInterface {
  private model: StaticModel;

  constructor(model: StaticModel) {
    this.model = model;
  }

  async find(
    where: object,
    config?: ModelFindConfig
  ): Promise<RecordInterface[]> {
    const query = this.model;

    if (config.sort) query.sort(config.sort);

    const records: Model[] = await query.find(where);

    return records.map((record: Model) => new MongoritoRecordAdapter(record));
  }

  findAll(): Promise<RecordInterface[]> {
    return this.find({});
  }

  create(data: object): RecordInterface {
    return new MongoritoRecordAdapter(new this.model(data));
  }
}
