import { RecordInterface } from './record/Record';

export interface ModelFindConfig {
  sort: object;
}

export interface ModelInterface {
  create<T>(data: object): RecordInterface<T>;
  find<T>(
    where: object,
    config?: ModelFindConfig
  ): Promise<RecordInterface<T>[]>;
  findAll<T>(): Promise<RecordInterface<T>[]>;
}
