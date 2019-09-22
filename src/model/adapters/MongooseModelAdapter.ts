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

      if (config.sort) query.sort(config.sort);

      query.exec((error, results: Document[]) => {
        if (error) return reject(error);

        const records = results.map(
          (result: Document) => new MongooseRecordAdapter<T>(result)
        );

        return resolve(new MongooseRecordCollectionAdapter(records));
      });
    });
  }

  findAll<T>(): Promise<RecordCollectionI<T>> {
    return this.find<T>({});
  }

  create<T>(data: object): RecordI<T> {
    return new MongooseRecordAdapter<T>(new this.model(data));
  }

  createAll<T>(datas: object[]): RecordCollectionI<T> {
    return new MongooseRecordCollectionAdapter(
      datas.map(data => this.create(data))
    );
  }

  async upsertAll<T>(
    upserts: ModelUpsertConfig[]
  ): Promise<RecordCollectionI<T>> {
    const ops = upserts.map((upsert: ModelUpsertConfig) => {
      return {
        updateOne: {
          upsert: true,
          update: upsert.data,
          filter: upsert.where,
        },
      };
    });

    const records = await this.model.bulkWrite(ops);

    return new MongooseRecordCollectionAdapter(
      records.result.upserted.map(
        (record: Document) => new MongooseRecordAdapter<T>(record)
      )
    );
  }
}
