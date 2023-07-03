import config from 'config';
import net from 'net';
import fs, { readFileSync, writeFileSync } from 'fs';
import { WebSocket } from 'ws';
import * as flatbuffers from 'flatbuffers';
import * as flexbuffers from 'flatbuffers/js/flexbuffers';
import Logger from '../Logger';
import { CSMErrorResponse, CSMResponse, ConfigurationData, SubscribeStructInfoUnpacked } from './types';
import { join_system } from '../m-b/msg/join_system';
import { Message } from '../m-b/msg/message';
import { Messages_type } from '../m-b/msg/messages_type';
import { subscribe_struct_info } from '../m-b/msg/subscribe_struct_info';
import { sendData } from '../server';
import { ConnectionInterval } from './ConnectionInterval';
import { reflect_attributes } from '../m-b/msg/reflect_attributes';

export class CASIntegration {
  private readonly CSM_PORT: number = 47800;

  private CSMConnection: net.Socket;

  private MBConnection: net.Socket;
  private MBConnectionInterval: ConnectionInterval;
  private MBMessageCounter: number = 0;
  private messagesCount: number = 0;

  private builder = new flatbuffers.Builder();

  private moduleList: string[];
  private fetchedModulesCount: number = 0;
  private subscribedModules: string[] = [];
  private subscribedModulesCount: number = 0;

  private modulesOutput: Record<string, ConfigurationData["Input"]> = {};
  private modulesGeneralSettings: Record<string, Record<string, (number | string)>> = {};
  private descriptorsMap: Record<number, string> = {};
  private handlesMap: Record<number, Record<number, string>> = {};
  private currentData: Record<number, any[]> = {};

  constructor() {
    this.initCSMConnection();
  }

  private initCSMConnection() {
    this.CSMConnection = net.createConnection(
      { port: this.CSM_PORT },
      () => Logger.info(`TCP соединение c ПМ МКС через порт ${this.CSM_PORT} установлено.`)
    );

    this.CSMConnection.on("data", this.handleCSMMessage.bind(this));

    this.CSMConnection.on("close", () => Logger.info(`TCP соединение с ПМ МКС разорвано.`));

    this.getModuleList();
  }

  private initMBConnection(host: string, port: number) {
    this.MBConnection = net.createConnection(
      { host, port, noDelay: true },
      () => {
        this.CSMConnection.end()
        this.MBConnectionInterval.clearReconnectionInterval();
        Logger.info(`TCP соединение ${host}:${port} c ПМ БС установлено.`)
        console.log(this.MBConnection.localPort);
      },
    );

    this.MBConnection.on("data", this.handleBSMessage.bind(this));

    this.MBConnection.on("error", (err) => this.handleDisconnect("БС", err));
    this.MBConnection.on("close", this.handleDisconnect.bind(this, "БС"));
    this.MBConnection.on("end", this.handleDisconnect.bind(this, "БС"));

    this.joinSystemBSRequest();
  }

  private handleDisconnect(moduleName: string, err?: Error) {
    if (err) {
      Logger.error(`Ошибка в соединении с ПM ${moduleName}: ${err}`);
    }

    Logger.info(`TCP соединение с ПМ ${moduleName} разорвано.`);
    this.MBConnectionInterval.launchIntervalConnect();
  }

  private handleCSMMessage(data: Buffer) {
    const dataString = data.toString().slice(0, -1);
    const { response } = JSON.parse(dataString) as (CSMResponse | CSMErrorResponse);

    if ("status" in response) {
      console.log(data.toString());
    } else if (Array.isArray(response)) {
      this.moduleList = response;
      Logger.info(`Список программных модулей получен.`)
      this.fetchCSMRequest(this.moduleList[this.fetchedModulesCount]);
    } else {
      const currentModule = this.moduleList[this.fetchedModulesCount];

      this.modulesOutput[currentModule] = response.Output;
      this.modulesGeneralSettings[currentModule] = {}

      for (let setting of response.general_settings) {
        if (!("value" in setting)) continue;

        this.modulesGeneralSettings[currentModule][setting["name_param"]] = setting["value"];
      }

      Logger.info(`Конфигурационные данные по ПМ "${currentModule}" получены.`)
      this.fetchedModulesCount++;
    
      if (this.fetchedModulesCount !== this.moduleList.length) {
        this.fetchCSMRequest(this.moduleList[this.fetchedModulesCount]);
      } else {
        let host: string;
        let port: number;

        for (let setting of response.System_settings) {
          if (!("value" in setting)) continue;
  
          switch (setting.name_param) {
            case "host_bs":
              host = setting.value;
              break;
            case "port_bs":
              port = setting.value;
              break;
          }
        }
  
        if (host && port) {
          this.MBConnectionInterval = new ConnectionInterval(this, this.initMBConnection, [host, port]);
          this.initMBConnection(host, port);
        }
      }

    }
  }

  private handleBSMessage(data: Buffer) {
    this.MBMessageCounter++;
    this.parseBSMessage(data);
  }

  private async parseBSMessage(data: Buffer) {
    const buffer = new flatbuffers.ByteBuffer(Uint8Array.from(data));
    const message = Message.getRootAsMessage(buffer);
    const unpackedMessage = message.unpack();

    switch (message.dataType()) {
      case Messages_type.join_system_resp:
        let moduleCount = 1;

        Object.keys(this.modulesOutput).forEach((module) => {
          const moduleData = this.modulesOutput[module]

          if (moduleData.length && module !== "module10") {
            setTimeout(() => {
              this.subscribedModules.push(module);
              this.subscribeStructInfoBSRequest(moduleData[0]);
            }, 3 * moduleCount);

            moduleCount++;
          }

          this.messagesCount = moduleCount - 1;
        });

        break;

      case Messages_type.subscribe_struct_info_resp:
        const unpackedData = unpackedMessage.data as SubscribeStructInfoUnpacked;

        const currentModule = this.subscribedModules[this.subscribedModulesCount];
        this.subscribedModulesCount++;

        this.descriptorsMap[unpackedData.structHandle] = currentModule;

        const handlesMap: Record<number, string> = {};

        const fieldsHandle = unpackedData.fieldsHandle;

        for (let i = 0; i < fieldsHandle.length; i++) {
          handlesMap[fieldsHandle[i]] = this.modulesOutput[currentModule][0].fields[i].field_name;
        }

        this.handlesMap[currentModule] = handlesMap;
        break;

      case Messages_type.reflect_attributes:
        const unpackedValues = unpackedMessage.data["values"];
        const valuesAsBuffer = new Uint8Array(unpackedValues).buffer;

        let decodedValues = flexbuffers.toObject(valuesAsBuffer) as any[];
        decodedValues = decodedValues.map((item) => (typeof item === "bigint" || item === null) ? Number(item) : item);

        this.currentData[unpackedMessage.data["structHandle"]] = decodedValues;

        if (this.MBMessageCounter >= this.messagesCount) {
          this.MBMessageCounter = 0;
          this.sendData();
        }

        break;

      case Messages_type.request_from_mb_save_state:
        break;
    }

    this.builder.clear();
  }

  private getModuleList() {
    this.CSMConnection.write(JSON.stringify({
      "request": {
        "what": "module_list"
      }
    }) + "\0");
  }

  private fetchCSMRequest(module: string) {
    this.CSMConnection.write(JSON.stringify({
      "request": {
        "what": "fetch",
        "module": module,
        "section_name": "all"
      }
    }) + "\0");
  }

  private joinSystemBSRequest() {
    const joinSystemOffset = join_system.createjoin_system(
      this.builder,
      this.builder.createString("map2d"),
      this.builder.createString("v-0.2.0"),
    );

    const messageOffset = Message.createMessage(
      this.builder,
      Messages_type.join_system,
      joinSystemOffset,
    );

    this.builder.finish(messageOffset);
    const buffer = this.builder.asUint8Array();

    this.MBConnection.write(buffer);
    this.builder.clear();
  }

  private subscribeStructInfoBSRequest(moduleData: any) {
    this.builder.clear();

    const fieldsOffset = moduleData.fields.map(field => this.builder.createString(field.field_name));
    const fieldsVector = subscribe_struct_info.createFieldsVector(this.builder, fieldsOffset);

    const subscribtionOffset = subscribe_struct_info.createsubscribe_struct_info(
      this.builder,
      this.builder.createString(moduleData.struct_name),
      this.builder.createString(moduleData.object_name),
      fieldsVector,
    );

    const messageOffset = Message.createMessage(
      this.builder,
      Messages_type.subscribe_struct_info,
      subscribtionOffset,
    );

    this.builder.finish(messageOffset);

    const buffer = this.builder.asUint8Array();
    this.MBConnection.write(buffer)
    
    this.builder.clear();
  }

  private async sendData() {
    const descriptors = Object.keys(this.descriptorsMap);
    const data = {};
    const routes = {};

    for (let d of descriptors) {
      const moduleName = this.descriptorsMap[Number(d)];
      const moduleData = this.currentData[Number(d)];
      if (!moduleData) continue;

      const mappedData = {};
      const moduleFields = this.handlesMap[moduleName];

      for (let i = 0; i < moduleData.length; i += 2) {
        mappedData[moduleFields[moduleData[i]]] = moduleData[i + 1];
      }

      data[moduleName] = {
        ...mappedData,
        ...this.modulesGeneralSettings[moduleName],
      };

      // if (!("attached_to" in data[moduleName])) {
      //   routes[data[moduleName].id] = this.saveRoute(data[moduleName]);
      // }
    }

    sendData(Object.values(data), routes);
  }

  private saveRoute = async (feature: any) => {
    const routes = JSON.parse(fs.readFileSync('./JSON/Routes.json', 'utf-8'));
  
    const featureID = feature.id;
    const hasMercator = "X" in feature;
    const coords = hasMercator ? [feature.X, feature.Y] : [feature.latitude, feature.longitude];
  
    if (routes.hasOwnProperty(featureID)) {
      const lastPoint = routes[featureID][routes[featureID].length - 1]
  
      if (!(lastPoint[0] === coords[0] && lastPoint[1] === coords[1])) {
        routes[featureID].push(coords);
      }
      
    } else {
      routes[featureID] = [coords];
    }
  
    fs.writeFileSync('./JSON/Routes.json', JSON.stringify(routes));
  
    Logger.info('Данные о пройденных путях сохранены');
    return routes;
  };
}