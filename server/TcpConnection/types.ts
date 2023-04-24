interface SectionData {
  name_group: string;
  tr_name: string;
  discribe: string;
}

interface SectionDataWithValue extends SectionData {
  value: any;
  max_value: any;
  min_value: any;
  default_value: any;
}

interface SectionDataWithParams extends SectionData {
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

export interface ConfigurationDataResponse {
  response: ConfigurationData;
}