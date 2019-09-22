import { RecordI, RecordCollectionI } from './record/Record';

export interface ModelFindConfig {
  sort: object;
}

export interface ModelI {
  create<T>(data: object): RecordI<T>;
  createAll<T>(datas: object[]): RecordCollectionI<T>;
  find<T>(
    where: object,
    config?: ModelFindConfig
  ): Promise<RecordCollectionI<T>>;
  findAll<T>(): Promise<RecordCollectionI<T>>;
}
