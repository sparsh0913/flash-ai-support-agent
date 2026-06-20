# Stage 1: Build
FROM node:22 AS builder

WORKDIR /flash-backend

COPY package*.json ./

RUN npm install

COPY . .

RUN npx tsc

# Stage 2: Production
FROM node:22-alpine

WORKDIR /flash-backend

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /flash-backend/dist ./dist

EXPOSE 8080

CMD ["node","dist/server.js"]