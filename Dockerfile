FROM node:17
WORKDIR /usr/src/app
COPY package*.json /.
COPY . .
EXPOSE 3000
ENTRYPOINT ["npm" , "start"]
