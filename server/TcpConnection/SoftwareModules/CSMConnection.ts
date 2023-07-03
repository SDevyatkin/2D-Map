import net from 'net';
import Logger from '../../Logger';
import { CSMCallbackData, CSMErrorResponse, CSMResponse, ConfigurationData, FieldSource, FieldValue, Input } from '../types';

type ConnectedCallback = (data: CSMCallbackData) => void;

export class CSMConnection {
  private readonly PORT: number = 47800;
  private readonly MODULE_NAME: string = "map_2d";

  private connection: net.Socket;
  private connectedCallback: ConnectedCallback;

  private objectsFields: Record<string, Record<string, FieldValue | FieldSource>> = {};

  constructor(callback: ConnectedCallback) {
    this.connectedCallback = callback;

    this.initConnection();
    this.sendFetch();
  }

  private initConnection() {
    this.connection = net.createConnection(
      { port: this.PORT },
      () => Logger.info(`TCP соединение c ПМ МКС через порт ${this.PORT} установлено.`),
    );

    this.connection.on("data", this.handleMessage.bind(this));

    this.connection.on("close", () => Logger.info(`TCP соединение с ПМ МКС разорвано.`));
  }

  private handleMessage(data: Buffer) {
    const messages = data.toString().split("\0").slice(0, -1);

    for (let message of messages) {
      const response = JSON.parse(message) as (CSMResponse | CSMErrorResponse);

      if (!("what" in response)) {
        Logger.error(data.toString());
        continue;
      }

      switch(response.what) {
        case "fetch":
          this.newHandleFetch(response.response as ConfigurationData)
          break;
        case "module_list":
          const modules = response.response as string[];

          for (let module of modules) {
            module !== this.MODULE_NAME && this.sendFetch(module);
          }

          break;
      }
    }
  }

  private newHandleFetch(response: ConfigurationData) {
    const inputs = response.Input;

    for (let input of inputs) {

      for (let field of input.fields) {
        if ("source" in field) {
          this.objectsFields[input.struct_name][field.field_name] = field.source;
        } else {
          if (!this.objectsFields[input.struct_name]) this.objectsFields[input.struct_name] = {};

          this.objectsFields[input.struct_name][field.field_name] = field.init_value;
        }
      }
    }

    const systemSettings = this.getSystemSettings(response.System_settings);

    this.connectedCallback({
      objectsFields: this.objectsFields,
      systemSettings,
    });
  }

  private handleFetch(response: ConfigurationData) {

    let host: string, port: number;

    for (let setting of response.System_settings) {
      if (!("value" in setting)) continue;

      switch(setting.name_param) {
        case "host_bs":
          host = setting.value;
          break;
        case "port_bs":
          port = setting.value;
          break;
      }
    }

    return { host, port };
  }

  private sendFetch(module?: string) {
    this.connection.write(JSON.stringify({
      "request": {
        "what": "fetch",
        "module": module ? module : this.MODULE_NAME,
        "section_name": "all"
      }
    }) + "\0");
  }

  private sendModuleList() {
    this.connection.write(JSON.stringify({
      "request": {
        "what": "module_list"
      }
    }) + "\0");
  }

  private getSystemSettings(settings: ConfigurationData["System_settings"]) {
    let host: string, port: number;

    for (let setting of settings) {
      if (!("value" in setting)) continue;

      switch(setting.name_param) {
        case "host_bs":
          host = setting.value;
          break;
        case "port_bs":
          port = setting.value;
          break;
      }
    }

    return { host, port };
  }
}