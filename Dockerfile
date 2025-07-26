
FROM node:18.18.0

WORKDIR /app

COPY package*.json ./

RUN npm install && npm dedupe

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:both"]