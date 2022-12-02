import net from 'net';
import config from 'config';
import dgram, { Socket } from 'dgram';
import fs from 'fs';
import express from 'express';
import path from 'path';
import engines from 'consolidate';
import cors from 'cors';
import ws from 'ws';
import { IMapConfig, IMapMetaData } from './interfaces';
import { calculateDistance, distanceRoute } from './utils';

interface IClients{
    [key: number]: WebSocket 
}

const PORT: number = 50051;
const HOST: string = config.get('TCPHost');
let socketList: IClients = {};
let socketMapDataFreq: number = 200;
let clientID: number = 1;


// TCP

let TCPEvents: any = {};
const sockets: net.Socket[] = [];
const server = net.createServer();

server.listen(PORT, HOST, () => console.log(`TCP Server running on port ${PORT}`));

server.on('connection', (socket) => {
    console.log(`Подключен: ${socket.remoteAddress}:${socket.remotePort}`);

    sockets.push(socket);

    socket.on('data', (buffer) => {
        try {
            TCPEvents = JSON.parse(buffer.toString());

            console.log(TCPEvents);

            const kills = TCPEvents.events.kill;

            kills.forEach((item) => { jsonData[item].parentID = 'death' });
        } catch (error) {
            console.log(`Некорректный запрос на удаление: ${error.message}`);
        }
    });

    socket.on('error', (error) => console.log(`Ошибка: ${error.message}`));

    socket.on('close', () => {
        const index = sockets.findIndex((s) => s.remoteAddress === socket.remoteAddress && s.remotePort === socket.remotePort);

        if (index === -1) sockets.splice(index, 1);

        console.log(`Отключен: ${socket.remoteAddress}:${socket.remotePort}`)
    });
});

// UDP

const jsonData = {};

let block = false;

const getData = () => {
    const serverData = dgram.createSocket('udp4');

    serverData.on('error', () => serverData.close());

    serverData.on('message', (message, remoteInfo) => {
        try {
            const parsedMessage = JSON.parse(message.toString());

            parsedMessage.data.forEach((item, i) => jsonData[parsedMessage.data[i].id] = item);

            console.log(jsonData);
            console.log('-------------------------------------------');
            const keys = Object.keys(socketList);
            if (!block) {
                for (let i = 0; i < keys.length; i++) {
                    sendMapData(jsonData, socketList[keys[i]]);
                }
                block = true;
                setTimeout(() => { block = false }, socketMapDataFreq);
                saveRoutes(jsonData);
            }
        } catch (error) {
            console.log(error.message);
        }
    });

    serverData.on('listening', () => {
        const address = serverData.address();
        console.log(`UDP listener is running on port ${address.port}`);
    });

    serverData.bind(50050);
};

// File System

const imageNames: string[] = [];
const imagesFolder = '../public/images';

fs.readdir(imagesFolder, (_, files) => {
    files.forEach((file) => imageNames.push(file));
});

const saveRoutes = (data) => {
  const routes = JSON.parse(fs.readFileSync('Routes.json', 'utf-8'));

  for (let id of Object.keys(data)) {
    if (routes.hasOwnProperty(id)) {
      routes[id].push([data[id].latitude, data[id].longitude]);
    } else {
      routes[id] = [[data[id].latitude, data[id].longitude]];
    }
  }
};

// Express

const app = express();

app.use(cors());
// app.use(express.static(path.join(__dirname, 'views')));
// app.use('/public', express.static(`${__dirname}/public`));
app.use(express.json());

app.engine('html', engines.mustache);

app.listen(3002, () => console.log('HTTP сервер запущен на 3002 порту.'));

app.get('/MapViewSettings', (_, response: express.Response) => {
  try {
    const mapConfig = JSON.parse(fs.readFileSync('MapViewSettings', 'utf-8'));
    response.send(mapConfig);
  } catch (error) {
    console.log(error.message);
    response.status(400);
  }
});

app.get('/MapURL', (_, response: express.Response) => {
  try {
    const mapURL = config.get('MapURL');
    response.send({ mapURL });
  } catch (error) {
    console.log(error.message);
    response.status(400);
  }
});

app.get('/MarkerSettings', (_, response: express.Response) => {
  try {
    const markerSettings = JSON.parse(fs.readFileSync('MarkerSettings.json', 'utf-8'));
    response.send(markerSettings);
  } catch (error) {
    console.log(error.message);
    response.status(400);
  }
});

app.get('/PolygonIcons', (_, response: express.Response) => {
  try {
    const polygonModels = JSON.parse(fs.readFileSync('PolygonIcons.json', 'utf-8'));
    response.send(polygonModels);
  } catch (error) {
    console.log(error.message);
    response.status(400);
  }
});

app.get('/Distance/:first/:second', (request: express.Request, response: express.Response) => {
  try {
    const first = jsonData[Number(request.params.first)];
    const second = jsonData[Number(request.params.second)];

    const coords1 = [first.latitude, first.longitude, first.altitude] as [number, number, number];
    const coords2 = [second.latitude, second.longitude, second.altitude] as [number, number, number];

    const distance = calculateDistance(coords1, coords2);
    const distanceCoords = distanceRoute(coords1.splice(-1) as [number, number], coords2.splice(-1) as [number, number]);

    response.send({ distance, distanceCoords });
  } catch (error) {
    console.log(error.message);
    response.status(400);
  }
});

app.get('/Route/:id', (request: express.Request, response: express.Response) => {
  try {
    const routes = JSON.parse(fs.readFileSync('Routes.json', 'utf-8'));
    const route = routes[request.params.id];

    response.send({ route });
  } catch (error) {
    console.log(error.message);
    response.status(400);
  }
});

app.post('/MarkerSettings', (request: express.Request, response: express.Response) => {
  try {
    fs.writeFileSync('MarkerSettings.json', request.body);
    response.send('Настройки маркеров обновлены.');
  } catch (error) {
    console.log(error.message);
    response.send(400);
  }
});

app.post('/PolygonIcons', (request: express.Request, response: express.Response) => {
  try {
    const polygonModels = JSON.parse(fs.readFileSync('PolygonModels.json', 'utf-8'));
    polygonModels[request.body.name] = request.body.data;

    fs.writeFileSync('PolygonIcons.json', polygonModels);
    response.send('Иконка добавлена.');
  } catch (error) {
    console.log(error.message);
    response.send(400);
  }
});

app.post('/MapViewSettings', (request: express.Request, response: express.Response) => {
  try {
    fs.writeFileSync('MapViewSettings.json', request.body);

    response.send('Настройки вида карты сохранены.');
  } catch (error) {
    console.log(error.message);
    response.status(400);
  }
});

setTimeout(getData, 0);

// ===================================================================

function sendMapData(mapData: any, wsClient: WebSocket | null) {
    wsClient.send(JSON.stringify(mapData));
}

const wsServer = new ws.Server({ port: 3001 });

wsServer.on('connection', onConnect);

function onConnect(wsClient) {

    socketList[clientID] = wsClient;

    clientID++;

    console.log('connection up');

    wsClient.on('close', function () {
        console.log('connection close');
    });
}

console.log('WebSocket сервер запущен на 3001 порту');