import { Model, Document } from 'mongoose';
import { ModelI, ModelFindConfig, ModelUpsertConfig } from '../Model';
import { RecordI, RecordCollectionI } from '../record/Record';
import { MongooseRecordAdapter } from '../record/adapters/MongooseRecordAdapter';
import { MongooseRecordCollectionAdapter } from '../record/adapters/MongooseRecordCollectionAdapter';

export class MongooseModelAdapter implements ModelI {
  private model: Model<Document>;

  constructor(model: Model<Document>) {
    this.model = model;
  }

  find<T>(
    where: object,
    config?: ModelFindConfig
  ): Promise<RecordCollectionI<T>> {
    return new Promise((resolve, reject): void => {
      const query = this.model.find(where);

      if (config && config.sort) query.sort(config.sort);

      query.exec((error, results: Document[]) => {
        if (error) return reject(error);

        const records = results.map((result: Document) =>
          MongooseModelAdapter.record<T>(result)
        );

        return resolve(new MongooseRecordCollectionAdapter<T>(records));
      });
    });
  }

  findAll<T>(): Promise<RecordCollectionI<T>> {
    return this.find<T>({});
  }

  create<T>(data: object): RecordI<T> {
    return MongooseModelAdapter.record<T>(new this.model(data));
  }

  createAll<T>(datas: object[]): RecordCollectionI<T> {
    return new MongooseRecordCollectionAdapter<T>(
      datas.map(data => this.create(data))
    );
  }

  upsert<T>(where: object, data: object): Promise<RecordI<T>> {
    return new Promise((resolve: Function, reject: Function): void => {
      console.log(where, data, 'WHERE U AT');
      this.model.findOneAndUpdate(
        where,
        data,
        {
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
          new: true,
        },
        function itsHEREE(error: Error, record: Document) {
          if (error) return reject(error);
          if (record) return resolve(MongooseModelAdapter.record<T>(record));
        }
      );
    });
  }

  async upsertAll<T>(
    upserts: ModelUpsertConfig[]
  ): Promise<RecordCollectionI<T>> {
    const records: RecordI<T>[] = await Promise.all(
      upserts.map(
        (upsert: ModelUpsertConfig): Promise<RecordI<T>> => {
          return this.upsert<T>(upsert.where, upsert.data);
        }
      )
    );

    return new MongooseRecordCollectionAdapter(records);
  }

  static record<T>(record: Document): RecordI<T> {
    return MongooseRecordAdapter.create<T>(record);
  }
}
