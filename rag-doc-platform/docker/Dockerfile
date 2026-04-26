FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev \
    fftw-dev \
    glib-dev \
    tesseract-ocr \
    tesseract-ocr-data-eng

COPY server/package*.json ./
RUN npm install

COPY server/ ./

EXPOSE 5000

CMD ["node", "server.js"]