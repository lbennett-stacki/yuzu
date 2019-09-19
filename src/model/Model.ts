import { RecordInterface } from './record/Record';

export interface ModelFindConfig {
  sort: object;
}

export interface ModelInterface {
  create(data: object): RecordInterface;
  find(where: object, config?: ModelFindConfig): Promise<RecordInterface[]>;
  findAll(): Promise<RecordInterface[]>;
}
