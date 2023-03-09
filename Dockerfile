FROM ubuntu:22.04 as build2dmap

RUN apt upgrade -y && \
    apt update && \
    apt install -y nodejs npm

WORKDIR /webmap
COPY . .

CMD ["cd server", "npm run server", "cd ..", "npm start"]
# RUN cd server && \
#   npm run server && \
#   cd .. && \
#   npm start