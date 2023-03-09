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

fs.writeFileSync('./JSON/Routes.json', JSON.stringify({}));

const getData = () => {
    const serverData = dgram.createSocket('udp4');

    serverData.on('error', () => serverData.close());

    serverData.on('message', (message) => {
        try {
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
                setTimeout(() => { block = false }, socketMapDataFreq);
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

app.listen(3002, () => console.log('HTTP сервер запущен на 3002 порту.'));

app.get('/', (request: express.Request, response: express.Response) => {
  try {
    // console.log(cookie);
    // response.cookie('auth-cookie', cookie, {
    //   secure: false,
    //   maxAge: 3600 * 24 * 365,
    // });
    response.status(200).send('Connected');
    // console.log('response sended');
  } catch (err) {
    console.log(err.message);
    response.status(400);
  }
});

app.get('/MapViewSettings', (_, response: express.Response) => {
  try {
    const mapConfig = JSON.parse(fs.readFileSync('MapViewSettings.json', 'utf-8'));
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
    const markerSettings = JSON.parse(fs.readFileSync('./JSON/MarkerSettings.json', 'utf-8'));
    response.send(markerSettings);
  } catch (error) {
    console.log(error.message);
    response.status(400);
  }
});

app.get('/PolygonIcons', (_, response: express.Response) => {
  try {
    const polygonModels = JSON.parse(fs.readFileSync('./JSON/PolygonIcons.json', 'utf-8'));
    response.send(polygonModels);
  } catch (error) {
    console.log(error.message);
    response.status(400);
  }
});

app.get('/ImagesNames', (_, response: express.Response) => {
  try {
    const ImagesNames = fs.readdir('./public/images/', (_, files) => {
      response.send({ data: files });
    });
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
    response.sendStatus(400);
  }
});

app.get('/Route/:id', (request: express.Request, response: express.Response) => {
  try {
    const routes = JSON.parse(fs.readFileSync('./JSON/Routes.json', 'utf-8'));
    const route = routes[request.params.id];

    response.send(JSON.stringify({ [Number(request.params.id)]: route }));
  } catch (error) {
    console.log(error.message);
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
  } catch (err) {
    console.log(err.message);
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

    if (!newSessionSettings[userId].hasOwnProperty('map1')) {
      newSessionSettings[userId][1] = {};
      newSessionSettings[userId][2] = {};
      newSessionSettings[userId][3] = {};
      newSessionSettings[userId][4] = {};
    }

    fs.writeFileSync('./JSON/SessionSettings.json', JSON.stringify(newSessionSettings));
  } catch (err) {
    console.log(err.message);
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
  } catch (err) {
    console.log(err.message);
    response.sendStatus(400);
  }
});

app.post('/clearRoutes/:mapID', (request: express.Request, response: express.Response) => {
  try {
    const id = request.params.mapID;
    const userId = request.body.userId;
    const mapID = `map${id}`;

    delete routesByMap[userId][mapID];

    const sessionSettings = JSON.parse(fs.readFileSync('./JSON/SessionSettings.json', 'utf-8'));

    sessionSettings[userId][id].routes = [];

    fs.writeFileSync('./JSON/SessionSettings.json', JSON.stringify(sessionSettings));

  } catch (error) {
    console.log(error.message);
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
    const mapSettings = sessionSettings[userId][mapID];

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
  } catch (error) {
    console.log(error.message);
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

    console.log(sessionSettings);
    writeFileSync('./JSON/SessionSettings.json', JSON.stringify(sessionSettings));

  } catch (error) {
    console.log(error.message);
    response.sendStatus(400);
  }
});

app.post('/clearDistance/:mapID', (request: express.Request, response: express.Response) => {
  try {
    const mapID = request.params.mapID;
    const id = Number(mapID.slice(3));
    const userId = request.body.userId;

    const sessionSettings = JSON.parse(readFileSync('./JSON/SessionSettings.json', 'utf-8'));

    sessionSettings[userId][mapID].distances = [];
    
    writeFileSync('./JSON/SessionSettings.json', JSON.stringify(sessionSettings));
  } catch (err) {
    console.log(err.message);
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

  } catch (err) {
    console.log(err.message);
    response.sendStatus(400);
  }
});

app.post('/ClearInfoModals', (request: express.Request, response: express.Response) => {
  try {
    const mapID = request.body.mapID;
    const id = Number(mapID.slice(3));
    const userId = request.body.userId;

    const sessionSettings = JSON.parse(readFileSync('./JSON/SessionSettings.json', 'utf-8'));

    console.log(sessionSettings[userId][mapID].infoModals);
    sessionSettings[userId][mapID].infoModals.binded = [];
    sessionSettings[userId][mapID].infoModals.fixed = -1;
    console.log(sessionSettings[userId][mapID].infoModals);

    writeFileSync('./JSON/SessionSettings.json', JSON.stringify(sessionSettings));
  } catch (err) {
    console.log(err.message);
    response.sendStatus(400);
  }
});

app.post('/MarkerSettings', (request: express.Request, response: express.Response) => {
  try {
    console.log(request.body);
    fs.writeFileSync('./JSON/MarkerSettings.json', JSON.stringify(request.body));
    response.send('Настройки маркеров обновлены.');
  } catch (error) {
    console.log(error.message);
    response.sendStatus(400);
  }
});

app.post('/PolygonIcons', (request: express.Request, response: express.Response) => {
  try {
    const polygonModels = JSON.parse(fs.readFileSync('./JSON/PolygonIcons.json', 'utf-8'));

    polygonModels[request.body.name] = request.body.points;

    fs.writeFileSync('./JSON/PolygonIcons.json', JSON.stringify(polygonModels));
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

// WebSocket Server ===================================================================

const sendData = (features: IFeatures, routes: IRoutes, wsClient: WebSocket | null) => {
  const sub = [];
  
  for (let key of Object.keys(features)) {
    sub.push([key, features[key].altitude])
  }

  const idsByAltitude = sub.sort((a, b) => b[1] - a[1]).map(item => item[0]);

  const data = { features, idsByAltitude, routes, routesByMap, distancesByMap };

  wsClient.send(JSON.stringify(data));
}

const wsServer = new ws.Server({ port: 3001 });

wsServer.on('connection', onConnect);
wsServer.on('listening', (data) => {

});

function onConnect(wsClient: WebSocket) {

  const wsClientId = clientID;

  socketList[clientID] = wsClient;

  // console.log(Object.keys(socketList));
  // console.log(socketList)
  clientID++;

  console.log('connection up');

  wsClient.on('close', function () {

    // for (let [key, value] of Object.entries(socketList)) {
    //   if (value === wsClient) {
    //     // delete socketList[key];
    //     console.log(Object.keys(socketList));
    //   }
    // }
    delete socketList[String(wsClientId)];
    console.log('connection close');
  });
}

console.log('WebSocket сервер запущен на 3001 порту');