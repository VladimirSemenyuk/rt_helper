FROM node:8
RUN npm install -g serve
RUN mkdir service
COPY src service/src
COPY package.json service
COPY package-lock.json service

WORKDIR service

RUN npm i
CMD ["npm", "start"]
EXPOSE 8000
