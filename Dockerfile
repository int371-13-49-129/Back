FROM node:16.14-alpine3.14 as build-stage
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/ 
RUN npm install
COPY . /usr/src/app
CMD [ "npm", "start" ]
EXPOSE 3000