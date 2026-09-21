FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Created at runtime via the docker-compose volumes, but keep the app
# from crashing on a totally fresh checkout with no folders yet.
RUN mkdir -p uploads data

EXPOSE 3000

CMD ["node", "server.js"]
