# Getting Started with Create React App

##### $ git clone 
##### $ cd udpWebMapModule
##### $ npm install 
##### В файле config/default.js настроить url:
##### $ node main.js 

===============================================================================


### Cсылки на ресурсы

##### Map osm.pbf

https://drive.google.com/file/d/14IaN-Pq1xaQMpU5NAvfN1ueJm45n0HgU/view?usp=sharing

##### Docker images

https://drive.google.com/file/d/1gvSNqwFo6odYBEgWW20q4Dq7kbDZBLxp/view?usp=sharing

https://drive.google.com/file/d/1FwpMOc5LAPcet9bCYbB4XZ3dE947tU_9/view?usp=sharing

===============================================================================

### Установка контейнера tile_server
  
$ sudo docker volume create openstreetmap-data

$ sudo time docker run -v /home/ПОЛНЫЙ_ПУТЬ_ДО/mergedSerg.osm.pbf:/data.osm.pbf -v openstreetmap-data:/var/lib/postgresql/12/main overv/openstreetmap-tile-server:1.3.10 import

$ sudo docker run --name tile_server -p 80:80 -v openstreetmap-data:/var/lib/postgresql/12/main -d overv/openstreetmap-tile-server:1.3.10 run 

===============================================================================

### ПРИ ЗАПУСКЕ СИСТЕМЫ 
1. $ sudo docker start tile_server
2. $ cd udpWebMapModule
3. $ node main.js

===============================================================================