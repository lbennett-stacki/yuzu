import { Model, Document } from 'mongoose';
import { ModelI, ModelFindConfig } from '../Model';
import { RecordI } from '../record/Record';
import { MongooseRecordAdapter } from '../record/adapters/MongooseRecordAdapter';

export class MongooseModelAdapter implements ModelI {
  private model: Model<Document>;

  constructor(model: Model<Document>) {
    this.model = model;
  }

  find<T>(where: object, config?: ModelFindConfig): Promise<RecordI<T>[]> {
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

  findAll<T>(): Promise<RecordI<T>[]> {
    return this.find<T>({});
  }

  create<T>(data: object): RecordI<T> {
    return new MongooseRecordAdapter<T>(new this.model(data));
  }

  createAll<T>(datas: object[]): RecordI<T>[] {
    return datas.map(
      data => new MongooseRecordAdapter<T>(new this.model(data))
    );
  }
}
