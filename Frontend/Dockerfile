
FROM node:22 AS builder

WORKDIR /flash-frontend

COPY package*.json ./

RUN npm ci

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /flash-frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]