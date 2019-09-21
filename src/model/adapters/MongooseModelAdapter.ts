import { Model, Document } from 'mongoose';
import { ModelInterface, ModelFindConfig } from '../Model';
import { RecordInterface } from '../record/Record';
import { MongooseRecordAdapter } from '../record/adapters/MongooseRecordAdapter';

export class MongooseModelAdapter implements ModelInterface {
  private model: Model<Document>;

  constructor(model: Model<Document>) {
    this.model = model;
  }

  find<T>(
    where: object,
    config?: ModelFindConfig
  ): Promise<RecordInterface<T>[]> {
    return new Promise((resolve, reject): void => {
      const query = this.model.find(where);

      if (config.sort) query.sort(config.sort);

      query.exec((error, results: Document[]) => {
        if (error) return reject(error);

        const records = results.map(
          (result: Document): MongooseRecordAdapter<T> =>
            new MongooseRecordAdapter<T>(result)
        );

        return resolve(records);
      });
    });
  }

  findAll<T>(): Promise<RecordInterface<T>[]> {
    return this.find({});
  }

  create<T>(data: object): RecordInterface<T> {
    return new MongooseRecordAdapter(new this.model(data));
  }
}
