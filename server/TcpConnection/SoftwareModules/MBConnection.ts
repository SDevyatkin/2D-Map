import net from "net";
import Logger from '../../Logger';
import * as flatbuffers from 'flatbuffers';
import * as flexbuffers from 'flatbuffers/js/flexbuffers';
import { ConnectionInterval } from '../ConnectionInterval';
import { Message, MessageT } from '../../m-b/msg/message';
import { Messages_type } from '../../m-b/msg/messages_type';
import { CSMCallbackData, FieldSource, FieldSourceByModule, Input, ModuleData, ObjectsFields, SendData, SubscribeStructInfoUnpacked, SubscribtionForHandle } from '../types';
import { subscribe_struct_info } from '../../m-b/msg/subscribe_struct_info';
import { join_system } from '../../m-b/msg/join_system';

export class MBConnection {
  private readonly MODULE_NAME: string = "map_2D";

  private objectsFields: ObjectsFields;
  private host: string;
  private port: number;

  private builder: flatbuffers.Builder;

  private connection: net.Socket;
  private reconnector: ConnectionInterval;
  private sendData: SendData; 

  private modulesData: Record<number, ModuleData> = {};
  private subscribtions: SubscribtionForHandle[] = [];
  private fieldsByHandle: Record<number, Record<number, SubscribtionForHandle>> = {};
  private subscribedModules: number = 0;

  private messageCount: number = 0;
  private messageCounter: number = 0;
  private sendingLocked: boolean = false;

  constructor(data: CSMCallbackData, sendData: SendData) {
    this.objectsFields = data.objectsFields;
    this.host = data.systemSettings.host;
    this.port = data.systemSettings.port;
    this.builder = new flatbuffers.Builder();
    this.sendData = sendData;

    this.reconnector = new ConnectionInterval(this, this.initConnection);

    this.initConnection();
  }

  private initConnection() {
    this.connection = net.createConnection(
      { 
        host: this.host,
        port: this.port,
        noDelay: true,
      },
      () => {
        // this.connection.end()
        this.reconnector.clearReconnectionInterval();
        Logger.info(`TCP соединение ${this.host}:${this.port} c ПМ БС установлено.`);
      },
    );

    this.connection.on("data", this.handleMessage.bind(this));

    this.connection.on("error", (err) => this.handleDisconnect("БС", err));
    this.connection.on("close", this.handleDisconnect.bind(this, "БС"));
    this.connection.on("end", this.handleDisconnect.bind(this, "БС"));

    this.sendJoinSystem();
  }

  private handleDisconnect(moduleName: string, err?: Error) {
    if (err) {
      Logger.error(`Ошибка в соединении с ПM ${moduleName}: ${err.stack}`);
    }

    Logger.info(`TCP соединение с ПМ ${moduleName} разорвано.`);
    this.reconnector.launchIntervalConnect();
  }

  private handleMessage(data: Buffer) {
    const buffer = new flatbuffers.ByteBuffer(Uint8Array.from(data));
    const message = Message.getRootAsMessage(buffer);
    const unpackedMessage = message.unpack();

    switch(message.dataType()) {
      case Messages_type.join_system_resp:
        this.handleJoinSystem();
        break;
      case Messages_type.subscribe_struct_info_resp:
        this.handleSubscribeStructInfo(unpackedMessage)
        break;
      case Messages_type.reflect_attributes:
        this.handleReflectAttributes(unpackedMessage)
        break;
      case Messages_type.request_from_mb_save_state:
        this.handleSaveState(unpackedMessage)
        break;
    }
  }

  private handleJoinSystem() {
    const sources: FieldSourceByModule[] = [];

    for (let object of Object.values(this.objectsFields)) {
      const currID = Number(object["id"]);

      const moduleData = {};

      for (let [fieldName, fieldValue] of Object.entries(object)) {
        if (typeof fieldValue === "object") {
          moduleData[fieldName] = 0;
          sources.push({
            module: currID,
            field: fieldName,
            source: fieldValue,
          });

        } else if (fieldName !== "id") {
          moduleData[fieldName] = fieldValue;
        }
      }

      this.modulesData[currID] = moduleData as ModuleData;
    }

    const groupedSources = [];

    for (let source of sources) {
      const currSource = source.source;

      const index = groupedSources.findIndex((group) => {
        return group.structName === currSource.source_struct_name && group.objectName === currSource.source_object_name;
      });

      if (index !== -1) {
        groupedSources[index].fields.push(currSource.source_field_name);
      } else {
        groupedSources.push({
          module: source.module,
          field: source.field,
          structName: currSource.source_struct_name,
          objectName: currSource.source_object_name,
          fields: [currSource.source_field_name],
        });
      }
    }

    this.messageCount = Object.keys(this.modulesData).length;
    let timeout = -2;

    for (let group of groupedSources) {
      timeout += 2;

      const fields = group.fields.map((f) => ({ 
        module: group.module,
        field: group.field,
       }));
      this.subscribtions.push(...fields);

      setTimeout(() => {
        this.sendSubscribeStructInfo(group);
      }, timeout);
    }
  }

  private handleSubscribeStructInfo(message: MessageT) {
    const unpackedData = message.data as SubscribeStructInfoUnpacked;

    const structHandle = unpackedData.structHandle
    this.fieldsByHandle[structHandle] = {};
    unpackedData.fieldsHandle.forEach((handle) => {
      this.fieldsByHandle[structHandle][handle] = this.subscribtions[this.subscribedModules];
      this.subscribedModules++;
    });
  }

  private handleReflectAttributes(message: MessageT) {
    if (this.sendingLocked) return;

    const values = message.data["values"];
    const valuesAsBuffer = new Uint8Array(values).buffer;

    let decodedValues = flexbuffers.toObject(valuesAsBuffer) as any[];
    decodedValues = decodedValues = decodedValues.map((item) => (typeof item === "bigint" || item === null) ? Number(item) : item);
    
    const handle = message.data["structHandle"];

    for (let i = 0; i < decodedValues.length; i += 2) {
      const subscribtion = this.fieldsByHandle[handle][decodedValues[i]];

      this.modulesData[subscribtion.module][subscribtion.field] = decodedValues[i+1];
    }

    this.messageCounter++;
    if (this.messageCounter >= this.messageCount) {
      const features = [];

      for (let [key, value] of Object.entries(this.modulesData)) {
        features.push({
          id: +key,
          ...value,
        });
      }

      this.sendData(features, {});

      this.sendingLocked = true;
      setTimeout(() => {
        this.sendingLocked = false;
      }, 40);
    }
  }

  private handleSaveState(message: MessageT) {}

  private writeMessage(offset: number) {
    this.builder.finish(offset);
    const buffer = this.builder.asUint8Array();

    this.connection.write(buffer);
    this.builder.clear();
  }

  private sendJoinSystem() {
    const joinSystemOffset = join_system.createjoin_system(
      this.builder,
      this.builder.createString(this.MODULE_NAME),
      this.builder.createString("v-0.3.0"),
    );

    const messageOffset = Message.createMessage(
      this.builder,
      Messages_type.join_system,
      joinSystemOffset,
    );

    this.writeMessage(messageOffset);
  }

  private sendSubscribeStructInfo(group: any) {
    this.builder.clear();

    const fieldsOffset = group.fields.map((field) => this.builder.createString(field));
    const fieldsVector = subscribe_struct_info.createFieldsVector(this.builder, fieldsOffset);

    const subscribtionOffset = subscribe_struct_info.createsubscribe_struct_info(
      this.builder,
      this.builder.createString(group.structName),
      this.builder.createString(group.objectName),
      fieldsVector,
    );

    const messageOffset = Message.createMessage(
      this.builder,
      Messages_type.subscribe_struct_info,
      subscribtionOffset,
    );

    this.writeMessage(messageOffset);
  }
}