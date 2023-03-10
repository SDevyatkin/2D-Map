FROM ubuntu:22.04 as build2dmap

RUN apt upgrade -y && \
    apt update && \
    apt install -y gnome-terminal nodejs npm

WORKDIR /webmap
COPY . .

CMD ["bash", "start.sh"]
# CMD ["bash", "runClient.sh"]

# CMD ["cd server", "npm run server", "cd ..", "npm start"]

# RUN cd server && \
#   npm run server && \
#   cd .. && \
#   npm start