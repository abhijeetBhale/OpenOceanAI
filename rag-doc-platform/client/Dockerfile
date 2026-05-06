FROM node:20 AS builder

WORKDIR /app

ARG VITE_API_BASE=https://rag-doc-backend.onrender.com/api
ENV VITE_API_BASE=$VITE_API_BASE

COPY package*.json ./

RUN npm install --platform=linux --arch=x64

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]