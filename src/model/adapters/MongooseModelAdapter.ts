import { Model as MongooseModel, Document, PaginateResult } from 'mongoose';
import {
  ModelI,
  ModelFindConfig,
  ModelUpsertConfig,
  ModelPaginateConfigI,
  ModelPaginateResultI,
  ModelPopulateOptionsI,
} from '../Model';
import { RecordI, RecordCollectionI } from '../record/Record';
import { MongooseRecordAdapter } from '../record/adapters/MongooseRecordAdapter';
import { MongooseRecordCollectionAdapter } from '../record/adapters/MongooseRecordCollectionAdapter';

interface Model extends MongooseModel<Document> {
  paginate: Function;
}

export class MongooseModelAdapter implements ModelI {
  private model: Model;

  constructor(model: Model) {
    this.model = model;
  }

  find<T>(
    where: object,
    config: ModelFindConfig = {}
  ): Promise<RecordCollectionI<T>> {
    return new Promise((resolve, reject): void => {
      const query = this.model.find(where);

      if (config.load) query.populate(config.load);
      if (config.sort) query.sort(config.sort);
      if (config.limit) query.limit(config.limit);

      query.exec((error, results: Document[]) => {
        if (error) return reject(error);

        const records = results.map((result: Document) =>
          MongooseModelAdapter.record<T>(result)
        );

        return resolve(MongooseModelAdapter.recordCollection(records));
      });
    });
  }

  findOne<T>(
    where: object,
    config: ModelFindConfig = {}
  ): Promise<RecordI<T> | undefined> {
    return new Promise((resolve, reject): void => {
      this.model.findOne(where, {}, config, (error, result) => {
        if (error) return reject(error);
        resolve(MongooseModelAdapter.record(result));
      });
    });
  }

  findAll<T>(config?: ModelFindConfig): Promise<RecordCollectionI<T>> {
    return this.find<T>({}, config);
  }

  create<T>(data: object): RecordI<T> {
    return MongooseModelAdapter.record<T>(new this.model(data));
  }

  createAll<T>(datas: object[]): RecordCollectionI<T> {
    return MongooseModelAdapter.recordCollection(
      datas.map(data => this.create(data))
    );
  }

  upsert<T>(where: object, data: object): Promise<RecordI<T>> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.model.findOneAndUpdate(
        where,
        data,
        {
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
          new: true,
        },
        (error: Error, record: Document) => {
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

    return MongooseModelAdapter.recordCollection(records);
  }

  updateMany<T>(where: object, data: object): Promise<RecordCollectionI<T>> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.model.updateMany(where, data, (error: Error, record: Document) => {
        if (error) return reject(error);
        if (record) return resolve(MongooseModelAdapter.record<T>(record));
      });
    });
  }

  deleteOne<T>(where: object): Promise<RecordI<T>> {
    return new Promise((resolve, reject): void => {
      this.model.deleteOne(where, error => {
        if (error) return reject(error);

        return resolve();
      });
    });
  }

  delete<T>(where: object): Promise<RecordCollectionI<T>> {
    return new Promise((resolve, reject): void => {
      this.model.deleteMany(where, error => {
        if (error) return reject(error);

        return resolve();
      });
    });
  }

  deleteAll<T>(): Promise<RecordCollectionI<T>> {
    return this.delete({});
  }

  paginate<T>(
    where: object,
    options: ModelPaginateConfigI
  ): Promise<ModelPaginateResultI<T>> {
    return this.model
      .paginate(where, options)
      .then((result: PaginateResult<Document>) => ({
        totalPages: result.totalPages,
        records: MongooseModelAdapter.recordCollection(
          result.docs.map((doc: Document) => MongooseModelAdapter.record(doc))
        ),
      }));
  }

  static record<T>(record: Document): RecordI<T> | undefined {
    if (!record) return;

    return MongooseRecordAdapter.create<T>(record);
  }

  static recordCollection<T>(
    records: RecordI<T>[]
  ): RecordCollectionI<T> | undefined {
    if (!records) return;

    return new MongooseRecordCollectionAdapter<T>(records);
  }
}
