import { Model } from 'mongorito';
import { ModelInterface, ModelFindConfig } from '../Model';
import { RecordInterface } from '../record/Record';
import { Class } from '../../types/Class';
import { MongoritoRecordAdapter } from '../record/adapters/MongoritoRecordAdapter';

interface StaticModelInterface extends Class<Model> {
  find<T extends Model>(this: Class<T>, query?: object): Promise<T[]>;
  sort<T extends Model>(this: Class<T>, query?: object): Promise<T[]>;
}

export class MongoritoModelAdapter implements ModelInterface {
  private model: StaticModelInterface;

  constructor(model) {
    this.model = model;
  }

  async find(
    where: object,
    config?: ModelFindConfig
  ): Promise<RecordInterface[]> {
    const query = this.model;

    if (config.sort) query.sort(config.sort);

    const records = await query.find(where);

    return records.map(record => new MongoritoRecordAdapter(record));
  }

  findAll(): Promise<RecordInterface[]> {
    return this.find({});
  }

  create(data: object): RecordInterface {
    return new MongoritoRecordAdapter(new this.model(data));
  }
}
