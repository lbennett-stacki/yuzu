import { RecordI, RecordCollectionI } from './record/Record';

export interface ModelFindConfig {
  sort?: object;
  limit?: number;
}

export interface ModelUpsertConfig {
  data: object;
  where: object;
}

export interface ModelHooksConfigI {
  pre?: {
    save: Function;
  };
}

export interface ModelOptionsConfigI {
  timestamps?: boolean;
  paginate?: boolean;
}

export interface ModelPaginateConfigI {
  page?: number;
  limit?: number;
  sort?: object;
}

export interface ModelPaginateResultI<T> {
  records: RecordCollectionI<T>;
  totalPages: number;
}

export interface ModelConfigI<T> {
  model: T;
  name: string;
  hooks?: ModelHooksConfigI;
  methods?: object;
  options?: ModelOptionsConfigI;
}

export interface ModelI {
  create<T>(data: object): RecordI<T>;
  createAll<T>(datas: object[]): RecordCollectionI<T>;
  upsert<T>(where: object, data: object): Promise<RecordI<T>>;
  upsertAll<T>(upserts: ModelUpsertConfig[]): Promise<RecordCollectionI<T>>;
  find<T>(
    where: object,
    config?: ModelFindConfig
  ): Promise<RecordCollectionI<T>>;
  findOne<T>(where: object, config?: ModelFindConfig): Promise<RecordI<T>>;
  findAll<T>(config?: ModelFindConfig): Promise<RecordCollectionI<T>>;
  deleteOne<T>(where: object): Promise<RecordI<T>>;
  delete<T>(where: object): Promise<RecordCollectionI<T>>;
  deleteAll<T>(): Promise<RecordCollectionI<T>>;
  paginate<T>(
    where: object,
    options: ModelPaginateConfigI
  ): Promise<ModelPaginateResultI<T>>;
}
