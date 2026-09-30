# -----------------------------
# Stage 1: Build React frontend
# -----------------------------
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Frontend API URLs
ARG VITE_PRODUCT_SERVICE_URL
ARG VITE_USER_SERVICE_URL
ARG VITE_ORDER_SERVICE_URL
ARG VITE_PAYMENT_SERVICE_URL
ARG VITE_NOTIFICATION_SERVICE_URL

ENV VITE_PRODUCT_SERVICE_URL=$VITE_PRODUCT_SERVICE_URL
ENV VITE_USER_SERVICE_URL=$VITE_USER_SERVICE_URL
ENV VITE_ORDER_SERVICE_URL=$VITE_ORDER_SERVICE_URL
ENV VITE_PAYMENT_SERVICE_URL=$VITE_PAYMENT_SERVICE_URL
ENV VITE_NOTIFICATION_SERVICE_URL=$VITE_NOTIFICATION_SERVICE_URL

RUN npm run build


# -----------------------------
# Stage 2: Production server
# -----------------------------
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
