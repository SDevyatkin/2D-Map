import net from 'net';
import config from 'config';
import dgram from 'dgram';
import fs, { readFileSync, writeFileSync } from 'fs';
import express from 'express';
import path from 'path';
import cors from 'cors';
import ws, { WebSocket } from 'ws';
import { calculateDistance, distanceRoute } from './utils';
import { IFeatures, IRoutes, IRoutesByMap, IDistancesByMap, IRoute } from './interfaces';
import cookieParser from 'cookie-parser';
import { v4 } from 'uuid';
import Logger from './Logger';
import { TCP } from './TcpConnection/TcpConnection';

// const addon = require("./addon/build/Release/addon");

// console.log(addon.my_function());

interface IClients {
  [key: number]: WebSocket;
}

const PORT: number = 50051;
const HOST: string = config.get('TCPHost');
let socketList: IClients = {};
let socketMapDataFreq: number = 40;
let clientID: number = 1;
let routesID: number[] = [];
const routesByMap: IRoutesByMap = {};
const distancesByMap: IDistancesByMap = {};
const TcpConnection = TCP;
// const logger = new Logger();
fs.writeFileSync(Logger.targetFile, '');

// TCP

let TCPEvents: any = {};
const sockets: net.Socket[] = [];
const server = net.createServer();

// server.listen(PORT, HOST, () => {
//   Logger.info(`TCP Server running on port ${PORT}`);
//   // logger.log(logger.INFO, `TCP Server running on port ${PORT}`);
//   // console.log(`TCP Server running on port ${PORT}`);
// });

// server.on('connection', (socket) => {
//     Logger.info(`Создано TCP соединение: ${socket.remoteAddress}:${socket.remotePort}`);

//     sockets.push(socket);

//     socket.on('data', (buffer) => {
//         try {
//           TCPEvents = JSON.parse(buffer.toString());

//           Logger.info(`Пришло событие TCP ${JSON.stringify(TCPEvents.events)}`);

//           const kills = TCPEvents.events.kill;

//           kills.forEach((item) => { jsonData[item].parentID = 'death' });
//           Logger.info(`Событие TCP обработано`);
//         } catch (error) {
//           Logger.warn(`Некорректный запрос на удаление: ${error.message}`);
//         }
//     });

//     socket.on('error', (error) => Logger.warn(`TCP соединение: ${error.message}`));

//     socket.on('close', () => {
//         const index = sockets.findIndex((s) => s.remoteAddress === socket.remoteAddress && s.remotePort === socket.remotePort);

//         if (index === -1) sockets.splice(index, 1);

//         Logger.info(`Соединение TCP разорвано: ${socket.remoteAddress}:${socket.remotePort}`)
//     });
// });

// UDP

const jsonData = {};

let block = false;

fs.writeFileSync('./JSON/Routes.json', JSON.stringify({}));

const getData = () => {
    const serverData = dgram.createSocket('udp4');

    serverData.on('error', () => {
      Logger.warn('Соединение UDP разорвано')
      serverData.close()
    });

    serverData.on('message', (message) => {
        try {
            Logger.info('Данные получены UDP');
            const parsedMessage = JSON.parse(message.toString());
            // console.log(parsedMessage);

            parsedMessage.data.forEach((item, i) => jsonData[parsedMessage.data[i].id] = item);

            // console.log('-------------------------------------------');
            const keys = Object.keys(socketList);
            if (!block) {
                const routes = saveRoutes(jsonData);
                Object.keys(routes).map(key => {
                  if (routesID.indexOf(Number(key)) === -1) {
                    delete routes[key];
                  }
                });
                for (let i = 0; i < keys.length; i++) {
                    // console.log(keys[i]);
                    sendData(jsonData, routes, socketList[keys[i]]);
                }
                block = true;
                setTimeout(() => { 
                  block = false;
                }, socketMapDataFreq);
            }
            Logger.info(`Данные UDP обработаны`);

        } catch (error) {
            Logger.warn(`Не получилось обработать данные UDP: ${error.message}`)
            // console.log(error.message);
        }
    });

    serverData.on('listening', () => {
        const address = serverData.address();
        Logger.info(`UDP listener is running on port ${address.port}`);
        // console.log(`UDP listener is running on port ${address.port}`);
    });

    serverData.bind(50050);
};

// File System

const imageNames: string[] = [];
const imagesFolder = '../public/images';

fs.readdir(imagesFolder, (_, files) => {
  files.forEach((file) => imageNames.push(file));
  Logger.info('Считан список изображений для графических объектов');
});

const saveRoutes = (data: IFeatures) => {
  const routes = JSON.parse(fs.readFileSync('./JSON/Routes.json', 'utf-8'));

  for (let id of Object.keys(data)) {
    if (routes.hasOwnProperty(id)) {
      const lastPoint = routes[id][routes[id].length - 1]

      if (!(lastPoint[0] === data[id].latitude && lastPoint[1] === data[id].longitude)) {
        routes[id].push([data[id].latitude, data[id].longitude]);
      }
      
    } else {
      routes[id] = [[data[id].latitude, data[id].longitude]];
    }
  }

  fs.writeFileSync('./JSON/Routes.json', JSON.stringify(routes));

  Logger.info('Данные о пройденных путях сохранены');
  return routes;
};

// Express

const app = express();

app.use(cors());
// app.use(express.static(path.join(__dirname, 'views')));
// app.use('/public', express.static(`${__dirname}/public`));
app.use(express.json());

app.use(cookieParser('key'));

app.use('/public', express.static(path.join(__dirname, '/public')))
// app.engine('html', engines.mustache);

app.listen(3002, () => Logger.info('HTTP сервер запущен на 3002 порту.'));
// app.listen(3002, () => console.log('HTTP сервер запущен на 3002 порту.'));

app.get('/', (request: express.Request, response: express.Response) => {
  try {
    // console.log(cookie);
    // response.cookie('auth-cookie', cookie, {
    //   secure: false,
    //   maxAge: 3600 * 24 * 365,
    // });
    response.status(200).send('Connected');
    Logger.info('Тестовый запрос обработан')
    // console.log('response sended');
  } catch (err) {
    Logger.error(`Не получилось обратать тестовый запрос:\n`);
    console.log(err.message);
    response.status(400);
  }
});

app.get('/MapViewSettings', (_, response: express.Response) => {
  try {
    const mapConfig = JSON.parse(fs.readFileSync('MapViewSettings.json', 'utf-8'));
    response.send(mapConfig);
    Logger.info('Настройки видов виджетов отправлены');
  } catch (error) {
    Logger.warn(`Не получилось отправить настройки видов виджетов:\n${error.message}`);
    response.status(400);
  }
});

app.get('/MapURL', (_, response: express.Response) => {
  try {
    const mapURL = config.get('MapURL');
    response.send({ mapURL });
    Logger.info('URL тайлового сервера отправлен');
  } catch (error) {
    Logger.warn(`Не получилось отправить URL тайлового сервера:\n${error.message}`);
    response.status(400);
  }
});

app.get('/MarkerSettings', (_, response: express.Response) => {
  try {
    const markerSettings = JSON.parse(fs.readFileSync('./JSON/MarkerSettings.json', 'utf-8'));
    response.send(markerSettings);
    Logger.info('Настройки графических объектов отправлены');
  } catch (error) {
    Logger.warn(`Не получилось отправить настройки графических объектов:\n${error.message}`);
    response.status(400);
  }
});

app.get('/PolygonIcons', (_, response: express.Response) => {
  try {
    const polygonModels = JSON.parse(fs.readFileSync('./JSON/PolygonIcons.json', 'utf-8'));
    response.send(polygonModels);
    Logger.info('Двухмерные пользовательские иконки отправлены');
  } catch (error) {
    Logger.warn(`Не получилось отправить двухмерные пользовательские иконки:\n${error.message}`);
    response.status(400);
  }
});

app.get('/ImagesNames', (_, response: express.Response) => {
  try {
    const ImagesNames = fs.readdir('./public/images/', (_, files) => {
      response.send({ data: files });
    });
    Logger.info('Список изображений для графических объектов отправлен');
  } catch (error) {
    Logger.warn(`Не получилось отправить список изображений для графических объектов:\n${error.message}`);
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

    Logger.info(`Расстояние между объектами ${first} и ${second} посчитано и отправлено`);
  } catch (error) {
    Logger.warn(`Не получилось отправить расстояние между объектами:\n${error.message}`);
    response.sendStatus(400);
  }
});

app.get('/Route/:id', (request: express.Request, response: express.Response) => {
  try {
    const routes = JSON.parse(fs.readFileSync('./JSON/Routes.json', 'utf-8'));
    const route = routes[request.params.id];

    response.send(JSON.stringify({ [Number(request.params.id)]: route }));
    Logger.info(`Пройденный объектом ${request.params.id} путь отправлен`);
  } catch (error) {
    Logger.warn(`Не получилось отправить пройденный объектом путь:\n${error.message}`);
    response.status(400);
  }
});

// app.post('/Route/:id', (request: express.Request, response: express.Response) => {
//   try {
//     console.log('"/Route/:id" post endpoint');
//     console.log(request.body);
//     const routes = JSON.parse(fs.readFileSync('./JSON/Routes.json', 'utf-8'));
//     const route = routes[request.params.id];

//     console.log(Object.keys(routes), route.length);

//     response.send(JSON.stringify({ [Number(request.params.id)]: route }));
//   } catch (error) {
//     console.log(error.message);
//     response.status(400);
//   }
// });

app.get('/SessionSettings/:userID', (request: express.Request, response: express.Response) => {
  try {
    const sessionSettings = JSON.parse(fs.readFileSync('./JSON/SessionSettings.json', 'utf-8'));
    const userID = request.params.userID;
    
    response.send(sessionSettings[userID] ? sessionSettings[userID]: {});
    Logger.info(`Настройки сессии пользователя ${userID} отправлены`);
  } catch (err) {
    Logger.warn(`Не получилось отправить настройки сессии пользователя:\n${err.message}`);
    response.status(400);
  }
});

app.post('/SidebarSettings/:userId', (request: express.Request, response: express.Response) => {
  try {
    const sidebarSettings = request.body;
    const userId = request.params.userId;

    const sessionSettings = JSON.parse(fs.readFileSync('./JSON/SessionSettings.json', 'utf-8'));

    const userSessionSettings = sessionSettings[userId];
    const newSessionSettings = {
      ...sessionSettings,
      [userId]: {
        ...userSessionSettings,
        sidebarSettings
      },
    };

    if (!newSessionSettings[userId].hasOwnProperty('1')) {
      newSessionSettings[userId][1] = {};
      newSessionSettings[userId][2] = {};
      newSessionSettings[userId][3] = {};
      newSessionSettings[userId][4] = {};
    }

    fs.writeFileSync('./JSON/SessionSettings.json', JSON.stringify(newSessionSettings));
    Logger.info(`Состояние бокового меню пользователя ${userId} сохранены`);
  } catch (err) {
    Logger.warn(`Не получилось сохранить состояние бокового меню:\n${err.message}`);
    response.sendStatus(400);
  }
});

app.post('/WidgetsLayout/:userId', (request: express.Request, response: express.Response) => {
  try {
    const { widgetsLayout } = request.body;
    const userId = request.params.userId;

    const sessionSettings = JSON.parse(fs.readFileSync('./JSON/SessionSettings.json', 'utf-8'));
    const userSessionSettings = sessionSettings[userId];

    const newSessionSettings = {
      ...sessionSettings,
      [userId]: {
        ...userSessionSettings,
        widgetsLayout
      },
    };

    fs.writeFileSync('./JSON/SessionSettings.json', JSON.stringify(newSessionSettings));
    Logger.info(`Расположение виджетов пользователя ${userId} сохранено`);
  } catch (err) {
    Logger.warn(`Не получилось сохранить расположение виджетов:\n${err.message}`);
    response.sendStatus(400);
  }
});

app.post('/clearRoutes/:mapID', (request: express.Request, response: express.Response) => {
  try {
    const id = request.params.mapID;
    console.log(request.body);
    const userId = request.body.userId;
    const mapID = `map${id}`;

    delete routesByMap[userId][mapID];

    const sessionSettings = JSON.parse(fs.readFileSync('./JSON/SessionSettings.json', 'utf-8'));

    sessionSettings[userId][id].routes = [];

    fs.writeFileSync('./JSON/SessionSettings.json', JSON.stringify(sessionSettings));
    Logger.info(`Пройденные объектами пути на карте ${id} очищены`);
  } catch (error) {
    Logger.warn(`Не получилось очистить пройденные пути:\n${error.message}`);
    response.sendStatus(400);
  }
});

app.post('/RouteID', (request: express.Request, response: express.Response) => {
  try {
    const object = Number(request.body.object);
    const mapID = request.body.mapID;
    const id = Number(mapID.slice(3));
    const color = request.body.color;
    const userId = request.body.userId

    const route: IRoute = {
      object, 
      color,
    };

    // console.log(mapSettings);

    if (!routesByMap.hasOwnProperty(userId)) {
      routesByMap[userId] = {
        [mapID]: [route],
      };
    } else if (routesByMap[userId].hasOwnProperty(mapID)) {
      routesByMap[userId][mapID].push(route);
    } else {
      routesByMap[userId][mapID] = [route];
    }

    routesID.push(object);

    const sessionSettings = JSON.parse(fs.readFileSync('./JSON/SessionSettings.json', 'utf-8'));
    const mapSettings = sessionSettings[userId][id];

    if (mapSettings.hasOwnProperty('routes')) {
      if (!mapSettings.routes.find(r => r.object === object)) {
        const newRoutes: IRoute[] = [...mapSettings.routes, route];
        mapSettings.routes = newRoutes;
      } else {
        const index = mapSettings.routes.findIndex(r => r.object === object);
        mapSettings.routes[index] = route;
      }
    } else {
      mapSettings.routes = [route];
    }

    // console.log(mapSettings);
    sessionSettings[userId][id] = mapSettings;

    fs.writeFileSync('./JSON/SessionSettings.json', JSON.stringify(sessionSettings));

    response.send(`Пройденный путь объекта ${object} построен.`);
    Logger.info(`Пройденный объектом ${object} путь на карте ${id} построен и сохранён в настройках сессии`);
  } catch (error) {
    Logger.warn(`Не получилось построить и сохранить пройденный путь:\n${error.message}`);
    response.sendStatus(400);
  }
});

app.post('/Distance', (request: express.Request, response: express.Response) => {
  try {
    const mapID = request.body.mapID;
    const id = Number(mapID.slice(3));
    let first = Number(request.body.first);
    let second = Number(request.body.second);
    const color = request.body.color;
    const userId = request.body.userId;

    console.log(userId);
    if (first < second) {
      const temp = first;
      first = second;
      second = temp;
    }

    const distance = `${first}_distance_${second}`;

    const distanceValue = {
      distance,
      color,
    };

    if (!distancesByMap.hasOwnProperty(userId)) {
      distancesByMap[userId] = {
        [mapID]: [distanceValue],
      };
    } else if (distancesByMap[userId].hasOwnProperty(mapID) && !distancesByMap[userId][mapID].some((d) => d.distance === distance)) {
      distancesByMap[userId][mapID].push(distanceValue);
    } else {
      distancesByMap[userId][mapID] = [distanceValue];
    }

    const sessionSettings = JSON.parse(readFileSync('./JSON/SessionSettings.json', 'utf-8'));

    const mapSettings = sessionSettings[userId][id];

    if (mapSettings.hasOwnProperty('distances')) {
      if (!mapSettings.distances.find(d => d.distance === distance)) mapSettings.distances.push(distanceValue);
    } else {
      mapSettings.distances = [distanceValue];
    }

    sessionSettings[userId][id] = mapSettings;

    writeFileSync('./JSON/SessionSettings.json', JSON.stringify(sessionSettings));
    Logger.info(`Расстояние между объектами ${first} и ${second} на карте ${id} построено и сохранёно в настройках сессии`);
  
    response.send({});
  } catch (error) {
    Logger.warn(`Не получилось построить и сохранить расстояние между объектами:\n${error.message}`);
    response.sendStatus(400);
  }
});

app.post('/clearDistance/:mapID', (request: express.Request, response: express.Response) => {
  try {
    const mapID = request.params.mapID;
    const id = Number(mapID.slice(3));
    const userId = request.body.userId;

    const sessionSettings = JSON.parse(readFileSync('./JSON/SessionSettings.json', 'utf-8'));

    sessionSettings[userId][id].distances = [];
    
    writeFileSync('./JSON/SessionSettings.json', JSON.stringify(sessionSettings));
    Logger.info(`Расстояния между объектами на карте ${id} очищены`);
  } catch (err) {
    Logger.warn(`Не получилось очистить расстояния между объектами:\n${err.message}`);
    response.sendStatus(400);
  }
});

app.post('/InfoModal', (request: express.Request, response: express.Response) => {
  try {
    const mapID = request.body.mapID;
    const id = Number(mapID.slice(3));
    const object = request.body.object;
    const placement = request.body.placement;
    const userId = request.body.userId;

    const sessionSettings = JSON.parse(readFileSync('./JSON/SessionSettings.json', 'utf-8'));

    if (!sessionSettings[userId][id].hasOwnProperty('infoModals')) {
      sessionSettings[userId][id].infoModals = {
        fixed: -1,
        binded: [],
      };
    }

    const mapInfoModals = sessionSettings[userId][id].infoModals;

    if (placement === 'fixed') {
      mapInfoModals.fixed = object;
    } else if (Array.isArray(mapInfoModals.binded) && !mapInfoModals.binded.find(i => i === object)) {
      mapInfoModals.binded.push(object);
    }

    sessionSettings[userId][id].infoModals = mapInfoModals;

    writeFileSync('./JSON/SessionSettings.json', JSON.stringify(sessionSettings));
    Logger.info(`Выведена информация об объекте ${object} на карте ${id} с ${placement === 'fixed' ? 'фиксированным расположением' : 'привязкой к объекту'} и сохранена в настройки сессии`);
  } catch (err) {
    Logger.warn(`Не получилось вывести и сохранить информацию об объекте:\n${err.message}`);
    response.sendStatus(400);
  }
});

app.post('/ClearInfoModals', (request: express.Request, response: express.Response) => {
  try {
    const mapID = request.body.mapID;
    const id = Number(mapID.slice(3));
    const userId = request.body.userId;

    const sessionSettings = JSON.parse(readFileSync('./JSON/SessionSettings.json', 'utf-8'));

    // console.log(sessionSettings[userId][id].infoModals);
    sessionSettings[userId][id].infoModals.binded = [];
    sessionSettings[userId][id].infoModals.fixed = -1;
    // console.log(sessionSettings[userId][id].infoModals);

    writeFileSync('./JSON/SessionSettings.json', JSON.stringify(sessionSettings));
    Logger.info(`Прекращён вывод информация об объктах на карте ${id} с сохранением в настройки сессии`);
  } catch (err) {
    Logger.warn(`Не получилось прекратить и сохранить вывод информация об объктах:\n${err.message}`);
    response.sendStatus(400);
  }
});

app.post('/MarkerSettings', (request: express.Request, response: express.Response) => {
  try {
    fs.writeFileSync('./JSON/MarkerSettings.json', JSON.stringify(request.body));
    response.send('Настройки маркеров обновлены.');
    Logger.info(`Сохранены настройки графических объектов`);
  } catch (error) {
    Logger.warn(`Не получилось сохранить настройки графических объектов:\n${error.message}`);
    response.sendStatus(400);
  }
});

app.post('/PolygonIcons', (request: express.Request, response: express.Response) => {
  try {
    const polygonModels = JSON.parse(fs.readFileSync('./JSON/PolygonIcons.json', 'utf-8'));

    polygonModels[request.body.name] = request.body.points;

    fs.writeFileSync('./JSON/PolygonIcons.json', JSON.stringify(polygonModels));
    response.send('Иконка добавлена.');
    Logger.info(`Сохранена двухмерная пользовательская модель: ${request.body.name}`);
  } catch (error) {
    Logger.warn(`Не получилось сохранить двухмерную пользовательскую модель:\n${error.message}`);
    response.send(400);
  }
});

app.post('/MapViewSettings', (request: express.Request, response: express.Response) => {
  try {
    fs.writeFileSync('MapViewSettings.json', request.body);
    response.send('Настройки вида карты сохранены.'); 
    Logger.info(`Сохранены настройки вида виджета карты`);
  } catch (error) {
    Logger.warn(`Не получилось сохранить настройки вида виджета карты:\n${error.message}`);
    response.status(400);
  }
});

setTimeout(getData, 0);

// WebSocket Server ===================================================================

const sendData = (features: IFeatures, routes: IRoutes, wsClient: WebSocket | null) => {
  const sub = [];
  
  for (let key of Object.keys(features)) {
    sub.push([key, features[key].altitude])
  }

  const idsByAltitude = sub.sort((a, b) => b[1] - a[1]).map(item => item[0]);

  const data = { features, idsByAltitude, routes, routesByMap, distancesByMap };

  Logger.info('Отправлен пакет данных через WebSocket');
  wsClient.send(JSON.stringify(data));
}

const wsServer = new ws.Server({ port: 3001 });

wsServer.on('connection', onConnect);
wsServer.on('listening', (data) => {

});
wsServer.on('error', () => Logger.error('Ошибка в работе WebSocket сервера'));

function onConnect(wsClient: WebSocket) {
  const wsClientId = clientID;

  // console.log(wsClientId, clientID, socketList);
  socketList[clientID] = wsClient;

  // console.log(Object.keys(socketList));
  // console.log(socketList)
  clientID++;

  Logger.info('connection up');
  // console.log('connection up');

  wsClient.on('close', function () {

    // for (let [key, value] of Object.entries(socketList)) {
    //   if (value === wsClient) {
    //     // delete socketList[key];
    //     console.log(Object.keys(socketList));
    //   }
    // }
    delete socketList[String(wsClientId)];
    Logger.info('connection close');
  });
}

Logger.info('WebSocket сервер запущен на 3001 порту');
// console.log('WebSocket сервер запущен на 3001 порту');