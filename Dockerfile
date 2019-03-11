FROM node:8

MAINTAINER clooooode<jackey8616@gmail.com>

EXPOSE 7777

WORKDIR /app

COPY . .

RUN npm i

CMD ["npm", "run-script", "run"]
