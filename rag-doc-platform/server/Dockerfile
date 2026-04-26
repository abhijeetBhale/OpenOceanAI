FROM node:20 AS builder

WORKDIR /app

# Install build dependencies for sharp
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    pkg-config \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    libvips-dev && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Install dependencies and rebuild sharp
RUN npm install && npm rebuild sharp

COPY . .

# Final stage
FROM node:20

WORKDIR /app

# Install sharp runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libjpeg62-turbo \
    libpango-1.0-0 \
    libgif7 \
    libvips42 && \
    rm -rf /var/lib/apt/lists/*

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

EXPOSE 5000

CMD ["npm", "start"]
