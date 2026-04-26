FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --platform=linux --arch=x64

COPY . .

EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
