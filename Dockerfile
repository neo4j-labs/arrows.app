FROM node:20.15.1-alpine

WORKDIR /app

COPY . /app

RUN npm ci

EXPOSE 4200

CMD [ "npx", "nx", "run", "arrows-ts:serve:production" ]
