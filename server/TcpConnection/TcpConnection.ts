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

  constructor() {
    // this.testTcpConnection = net.createConnection(
    //   { port: 4242 },
    //   () => Logger.info(`Тестовое TCP соединение через порт ${4242} установлено.`)
    // );

    this.csmTcpConnection = net.createConnection(
      {
        port: this.CSM_PORT,
      }, 
      () => {
        Logger.info(`TCP соединение c ПМ МКС через порт ${this.CSM_PORT} установлено.`);
      }
    );

    this.csmTcpConnection.on('data', (data: Buffer) => {
      console.log(data.toString());
      const { response } = JSON.parse(data.toString()) as ConfigurationDataResponse;
      
      if ('size' in response) {
        this.csmConnectionState = this.acceptRequest();
      }

      if ('System_settings' in response) {
        this.configureData = response;
        
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
          // console.log(`Host: ${this.MB_HOST}\nPort: ${this.MB_PORT}`);
          // this.getModuleList();
        }
      }

      // console.log(response);
    }); 

    this.csmConnectionState = this.fetchRequest();
    // this.getModuleList();
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
        // host: '127.0.0.1',
        // port: 42111,
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
      // const reflectAttributesOffset = reflect_attributes.createreflect_attributes(
      //   this.builder,
      //   7,
      //   3,
      //   20,
      //   this.builder.createString('maximus prime'),
      // );

      // builder.finish(joinSystemOffset);

      const messageOffset = Message.createMessage(this.builder, Messages_type.join_system, joinSystemOffset);
      // const messageOffset = Message.createMessage(this.builder, Messages_type.reflect_attributes, reflectAttributesOffset);
      this.builder.finish(messageOffset);
      const buffer = this.builder.asUint8Array();

      // console.log(this.builder);
      // console.log('*'.repeat(50));
      // console.log(this.builder.createString('maximus prime'))
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
          // const subscribeInfo = subscribe_struct_info_resp
          //   .getRootAssubscribe_struct_info_resp(
          //     new flatbuffers.ByteBuffer(data)
          //   );
          
          console.log(message.unpack().data)
            // console.log(subscribeInfo.incorrectRequest());
            // console.log(
            //   `fieldsHandle: ${subscribeInfo.fieldsHandle(subscribeInfo.bb_pos)}\n` +
            //   `fieldsHandleArray: ${subscribeInfo.fieldsHandleArray()}\n` +
            //   `fieldsHandleLength: ${subscribeInfo.fieldsHandleLength()}\n` +
            //   `incorrectRequest ${subscribeInfo.incorrectRequest()}\n` +
            //   `internalError: ${subscribeInfo.internalError()}\n` +
            //   `objectHandle: ${subscribeInfo.objectHandle()}\n` +
            //   `status: ${subscribeInfo.status()}\n` +
            //   `structHandle: ${subscribeInfo.structHandle()}`
            // );
            // console.log('Subscribe info ', subscribeInfo.objectHandle(), subscribeInfo.structHandle(), subscribeInfo.incorrectRequest());
          // message.bb.bytes().forEach((byte) => console.log(byte));
          break;
        default:
          // this.testTcpConnection.write(new Uint8Array(data));
          // console.log(new Uint8Array(data))
          // const ar16 = new Uint16Array(data.buffer, data.byteOffset, data.byteLength / Uint16Array.BYTES_PER_ELEMENT);
          // console.log(message.data({}));
          // console.log(new TextDecoder('UTF-8').decode(message.bb.bytes()));
          // const msg = Message.createMessage(this.builder, Messages_type.reflect_attributes, message.bb_pos);
          // this.builder.finish(msg);
          // const chars = message.unpack().data['values'].map(v => String.fromCharCode(v))
          // console.log(new TextDecoder().decode(Uint8Array.from(message.unpack().data['values'])));
          let reflAttrs = reflect_attributes.getRootAsreflect_attributes(message.bb)
          let values = message.unpack().data['values'];
          const ref = flexbuffers.toReference(message.bb.bytes().buffer)
          // const flexbuffer = flexbuffers.encode(values, values.length);
          const keys = Object.keys(ref);

          
          console.log('***************************************************');
          console.log(message.unpack().data['values'])

          writeFileSync('./flexbuffer_test.bin', Buffer.from(values), { encoding: 'binary' });
          // console.log(this.configureData.Output[0].fields.map(f => f.field_name));
          // console.log(message.unpack().data['values'].map(v => parseInt(v, 16)));
          // console.log(message.bb_pos);
          // console.log(reflAttrs.unpack())

          // for (let i = 0; i < ref.length(); i++) {
          //   console.log(ref);
          // }
          // console.log(values);
          // console.log(values.filter((_, i) => (i % 2 !== 0 && values[i - 1] > 0 && values[i - 1] < 10) || (i % 2 === 0 && values[i] > 0 && values[i] < 10)));
          // const reflectObj = new reflect_attributesT();
          // const reflectAttributes = reflect_attributes.getRootAsreflect_attributes(new flatbuffers.ByteBuffer(data));
          // reflectAttributes.unpackTo(reflectObj)

          // console.log(reflectObj.objectHandle, reflectObj.structHandle);
          // console.log(
          //   reflectAttributes.objectHandle(), 
          //   reflectAttributes.structHandle(), 
          //   reflectAttributes.timeStamp(),
          //   reflectAttributes.valuesArray(),
          //   reflectAttributes.values(0),
          //   reflectAttributes.valuesArray(),
          //   reflectAttributes.valuesLength(),
          // );
          // console.log(reflectAttributes.objectHandle(), reflectAttributes.structHandle());
          break;
      }
      // console.log(message.dataType());
      // join_system_resp.createjoin_system_resp(
      //   this.builder,
      //   message.data
      // );
      // console.log(new TextDecoder().decode(new Uint8Array(message.bb.bytes())));
      // Message.createMessage(this.builder, message.dataType(), bufferedData);
    });

    this.mbTcpConnection.on('close', () => console.log('MB TCP conn closed'));
  }

  private subscribeStructInfo() {
    this.builder.clear();

    const outputData = this.configureData.Output[0];
    const fields = outputData.fields.map((field) => this.builder.createString(field.field_name));

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

    // writeFile('test.bin', buffer, { encoding: 'binary' }, (err) => {
    //   if (err) throw err;
    //   console.log('saved');
    // });
    this.mbTcpConnection.write(buffer);
  }

  log() {
    // console.log(this.schema.needHandle());
  }
}

export const TCP = new TcpConnection();