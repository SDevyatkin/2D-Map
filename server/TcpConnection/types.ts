import { IRoutes } from '../interfaces';

interface SectionData {
  tr_name: string;
  discribe: string;
}

interface SectionDataWithValue extends SectionData {
  name_param: string;
  value: any;
  max_value: any;
  min_value: any;
  default_value: any;
}

interface SectionDataWithParams extends SectionData {
  name_group: string;
  params: ReadonlyArray<any>;
}

export type FieldValue = number | boolean | string;

export interface FieldSource {
  source_struct_name: string;
  source_field_name: string;
  source_object_name: string;
}

export interface FieldSourceByModule {
  module: number;
  field: string;
  source: FieldSource;
}

interface Field {
  field_name: string;
  tr_name: string;
  type_name: string;
  numbers_of_elements: number;
  discribe: string;
  init_value: FieldValue;
  source?: FieldSource;
}

export interface SubscribtionForHandle {
  module: number;
  field: string;
}

export interface Input {
  struct_name: string;
  discribe: string;
  tr_name: string;
  wait_all_source: boolean;
  fields: Field[];
}

interface Output extends Input {
  objects: string | string[];
}

export interface ConfigurationData {
  Input: ReadonlyArray<Input>;
  Output: ReadonlyArray<any>;
  Sync_mode: ReadonlyArray<(SectionDataWithValue | SectionDataWithParams)>;
  System_settings: ReadonlyArray<(SectionDataWithValue | SectionDataWithParams)>;
  general_settings: ReadonlyArray<(SectionDataWithValue | SectionDataWithParams)>;
  initial_settings: ReadonlyArray<(SectionDataWithValue | SectionDataWithParams)>;
  intermediate_state: ReadonlyArray<(SectionDataWithValue | SectionDataWithParams)>;
}

export interface SizeData {
  size: number;
}

// INCORRECT
export interface ConfigurationDataResponse {
  response: ConfigurationData;
}

export interface CSMResponse {
  response: ConfigurationData | string[];
  what: string;
}

export interface CSMErrorResponse {
  response: {
    status: string;
  }
}

export type ObjectsFields = Record<string, Record<string, FieldValue | FieldSource>>;

export interface CSMCallbackData {
  objectsFields: ObjectsFields;
  systemSettings: {
    host: string;
    port: number;
  };
}

export interface SubscribeStructInfoUnpacked {
  status: boolean;
  incorrectRequest: boolean;
  internalError: boolean;
  structHandle: number;
  objectHandle: number;
  fieldsHandle: number[];
}

export interface ModuleData {
  type: number;
  parentID: number;
  lon: number;
  lat: number;
  yaw: number;
}

export type SendData = (features: Record<number, ModuleData>, routes: IRoutes) => void;