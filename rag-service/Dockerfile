# Stage 1: Build

FROM node:22 AS builder

WORKDIR /flash-rag

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx tsc


# Stage 2: Production

FROM node:22-alpine

WORKDIR /flash-rag

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /flash-rag/dist ./dist

EXPOSE 5001

CMD ["node", "dist/src/index.js"]