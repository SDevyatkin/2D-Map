# v 1.0.0

### Установка node.js приложения

##### $ git clone 
##### $ cd server
##### $ npm install
##### В файле config/default.js настроить url:
##### $ npm run server
##### $ cd ..
##### $ npm install
##### $ npm start 

===============================================================================

### Cсылки на ресурсы

##### Map osm.pbf

https://drive.google.com/file/d/14IaN-Pq1xaQMpU5NAvfN1ueJm45n0HgU/view?usp=sharing

===============================================================================

### Установка контейнера tile_server
  
$ sudo docker volume create openstreetmap-data

$ sudo time docker run -v /home/ПОЛНЫЙ_ПУТЬ_ДО/mergedSerg.osm.pbf:/data.osm.pbf -v openstreetmap-data:/var/lib/postgresql/12/main overv/openstreetmap-tile-server:1.3.10 import

$ sudo docker run --name tile_server -p 80:80 -v openstreetmap-data:/var/lib/postgresql/12/main -d overv/openstreetmap-tile-server:1.3.10 run 

===============================================================================

### ПРИ ЗАПУСКЕ СИСТЕМЫ 
$ sudo docker start tile_server

===============================================================================

Протокол взаимодействия 

    UDP PORT:  50050

    TCP PORT: 50051

#### ADDRESS:

#### http://localhost:3000/
