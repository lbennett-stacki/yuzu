import { RecordI } from './record/Record';

export interface ModelFindConfig {
  sort: object;
}

export interface ModelI {
  create<T>(data: object): RecordI<T>;
  createAll<T>(datas: object[]): RecordI<T>[];
  find<T>(where: object, config?: ModelFindConfig): Promise<RecordI<T>[]>;
  findAll<T>(): Promise<RecordI<T>[]>;
}
