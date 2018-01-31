FROM node:8

RUN npm i serve -g

RUN mkdir client
COPY src client/src
COPY public client/public
COPY package.json client
COPY package-lock.json client

WORKDIR client
RUN npm i
RUN npm run build

CMD ["serve", "-s", "build"]
EXPOSE 5000
