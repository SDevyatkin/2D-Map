FROM ubuntu:22.04 as build2dmap

RUN apt upgrade -y && \
    apt update && \
    apt install -y gnome-terminal nodejs npm

WORKDIR /webmap
COPY . .

CMD ["bash", "start.sh"]


# docker build -t 2dmap .
# docker run -it --name map2d --network host 2dmap 