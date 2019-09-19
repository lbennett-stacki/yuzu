import { Model, Document } from 'mongoose';
import { ModelInterface, ModelFindConfig } from '../Model';
import { RecordInterface } from '../record/Record';
import { MongooseRecordAdapter } from '../record/adapters/MongooseRecordAdapter';

export class MongooseModelAdapter implements ModelInterface {
  private model: Model<Document>;

  constructor(model: Model<Document>) {
    this.model = model;
  }

  find(where: object, config?: ModelFindConfig): Promise<RecordInterface[]> {
    return new Promise((resolve, reject): void => {
      const query = this.model.find(where);

      if (config.sort) query.sort(config.sort);

      query.exec((error, results: Document[]) => {
        if (error) return reject(error);

        const records = results.map(
          (result: Document) => new MongooseRecordAdapter(result)
        );

        return resolve(records);
      });
    });
  }

  findAll(): Promise<RecordInterface[]> {
    return this.find({});
  }

  create(data: object): RecordInterface {
    return new MongooseRecordAdapter(new this.model(data));
  }
}
