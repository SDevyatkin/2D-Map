import { request_handle } from '../m-b/msg/request_handle';
import * as flatbuffers from 'flatbuffers';
import * as flexbuffers from 'flatbuffers/js/flexbuffers';
// import * as flexbuffers from 'flatbuffers/js/flexbuffers';
import net from 'net';
import config from 'config';
import Logger from '../Logger';
import { join_system } from '../m-b/msg/join_system';
import { reflect_attributes, reflect_attributesT} from '../m-b/msg/reflect_attributes';
import { Message } from '../m-b/msg/message';
import { Messages_type } from '../m-b/msg/messages_type';
import { join_system_resp } from '../m-b/msg/join_system_resp';
import { ConfigurationData, ConfigurationDataResponse } from './types';
import { subscribe_struct_info, subscribe_struct_infoT } from '../m-b/msg/subscribe_struct_info';
import { subscribe_struct_info_resp } from '../m-b/msg/subscribe_struct_info_resp';
import { writeFile, writeFileSync } from 'fs';

// const addon = require("../addons/flexbuffer_helper/build/Release/addon.node");

enum ConnectionState {
  N0_CONNECTION,
  FETCH,
  FETCHED,
  ACCEPT,
  ACCEPTED,
}

class TcpConnection {
  private readonly CSM_HOST: string = config.get('TCPHost');
  private readonly CSM_PORT: number = 47800;

  private MB_HOST: string;
  private MB_PORT: number;

  private csmConnectionState: ConnectionState = ConnectionState.N0_CONNECTION;
  private csmTcpConnection: net.Socket;
  
  private mbConnectionState: ConnectionState = ConnectionState.N0_CONNECTION;
  private mbTcpConnection: net.Socket;

  private testTcpConnection: net.Socket;

  private builder: flatbuffers.Builder;
  private configureData: ConfigurationData;

  private modelsData: Record<string, any> = {};
  private fieldsHandle: Record<string, Record<number, string>> = {};

  constructor() {

    this.csmTcpConnection = net.createConnection(
      {
        port: this.CSM_PORT,
      }, 
      () => {
        Logger.info(`TCP соединение c ПМ МКС через порт ${this.CSM_PORT} установлено.`);
      }
    );

    this.csmTcpConnection.on('data', (data: Buffer) => {
      const { response } = JSON.parse(data.toString()) as ConfigurationDataResponse;
      
      if ('size' in response) {
        this.csmConnectionState = this.acceptRequest();
      }

      if ('System_settings' in response) {
        this.configureData = response;
        
        this.modelsData["craft"] = {};
        this.fieldsHandle["craft"] = {};

        for (let setting of response['System_settings']) {
          if (!('value' in setting)) continue;
          
          switch(setting['name_param']) {
            case 'host_bs':
              this.MB_HOST = setting.value;
              break;
            case 'port_bs':
              this.MB_PORT = setting.value;
              break;
          }
        }

        if (this.MB_HOST && this.MB_PORT) {
          this.setMBConnection();
        }
      }

    }); 

    this.csmConnectionState = this.fetchRequest();
  }

  private getModuleList() {
    this.csmTcpConnection.write(JSON.stringify({
      "request": {
        "what": "module_list"
      }
    }));
  }

  private fetchRequest() {
    this.csmTcpConnection.write(JSON.stringify({
      "request": {
        "what": "fetch",
        "module": "craft",
        "section_name": "all"
      }
    }));

    return ConnectionState.FETCH;
  }

  

  private acceptRequest() {
    this.csmTcpConnection.write(JSON.stringify({
      "request": {
        "what": "accept"
      }
    }));
    return ConnectionState.ACCEPT;
  }

  private setMBConnection() {
    this.mbTcpConnection = net.createConnection(
      {
        host: this.MB_HOST,
        port: this.MB_PORT,
      },
      () => {
        Logger.info(`TCP соединение ${this.MB_HOST}:${this.MB_PORT} c ПМ БС установлено.`);
      }
    );

    setTimeout(() => {
      this.builder = new flatbuffers.Builder();
      const joinSystemOffset = join_system.createjoin_system(
        this.builder,
        this.builder.createString('2d_map'),
        this.builder.createString(''),
      );

      const messageOffset = Message.createMessage(this.builder, Messages_type.join_system, joinSystemOffset);
    
      this.builder.finish(messageOffset);
      const buffer = this.builder.asUint8Array();

      this.mbTcpConnection.write(buffer);
    }, 228);

    this.mbTcpConnection.on('data', (data: Buffer) => {
      this.builder.clear();
      const buffer = new flatbuffers.ByteBuffer(new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT));
      const message = Message.getRootAsMessage(buffer);

      switch(Messages_type[message.dataType()]) {
        case 'join_system_resp':
          this.subscribeStructInfo();
          break;
        case 'subscribe_struct_info_resp':
          // @ts-ignore
          const handles = message.unpack().data.fieldsHandle;
          
          for (let i in handles) {
            console.log(i);
          }

          break;
        default:
          let values = message.unpack().data['values'];
          
          values = new Uint8Array(values);

          let data = flexbuffers.toObject(values.buffer) as Array<any>;
          data = data.map(item => typeof item === "bigint" ? Number(item) : item);
          console.log(data)
          break;
      }
    });

    this.mbTcpConnection.on('close', () => console.log('MB TCP conn closed'));
  }

  private subscribeStructInfo() {
    this.builder.clear();

    const outputData = this.configureData.Output[0];
    const fields = outputData.fields.map((field) => {
      const fieldName = field.field_name;
      this.modelsData["craft"][fieldName] = undefined;

      return this.builder.createString(fieldName)
    });
    

    const fieldsVector = subscribe_struct_info.createFieldsVector(this.builder, fields);
    subscribe_struct_info.startFieldsVector(this.builder, fields.length);

    const subsriptionOffset = subscribe_struct_info.createsubscribe_struct_info(
      this.builder,
      this.builder.createString(outputData.struct_name),
      this.builder.createString(outputData.object_name),
      fieldsVector,
    );

    const messageOffset = Message.createMessage(this.builder, Messages_type.subscribe_struct_info, subsriptionOffset);

    this.builder.finish(messageOffset);

    const buffer = this.builder.asUint8Array();

    this.mbTcpConnection.write(buffer);
  }

}

export const TCP = new TcpConnection();