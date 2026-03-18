FROM node:18-alpine

ENV PORT 3001
EXPOSE 3001

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /usr/src/app
COPY package.json ./
RUN yarn install
COPY . .

CMD [ "node", "--openssl-legacy-provider", "server.js" ]