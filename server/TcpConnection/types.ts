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

export interface ConfigurationData {
  Input: ReadonlyArray<any>;
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

export interface SubscribeStructInfoUnpacked {
  status: boolean;
  incorrectRequest: boolean;
  internalError: boolean;
  structHandle: number;
  objectHandle: number;
  fieldsHandle: number[];
}