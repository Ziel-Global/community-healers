# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Vite inlines import.meta.env.VITE_* at build time, not runtime — there's no
# .env file in the build context (it's git/dockerignored on purpose, same as
# the backend's secrets), so these must come in as build args instead.
ARG VITE_BACKEND_URL=""
ARG VITE_ENABLE_PAYMENT_SIMULATION=""
ARG VITE_AWS_REGION=""
ARG VITE_COGNITO_IDENTITY_POOL_ID=""
ARG VITE_GOOGLE_MAPS_API_KEY=""
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_ENABLE_PAYMENT_SIMULATION=$VITE_ENABLE_PAYMENT_SIMULATION \
    VITE_AWS_REGION=$VITE_AWS_REGION \
    VITE_COGNITO_IDENTITY_POOL_ID=$VITE_COGNITO_IDENTITY_POOL_ID \
    VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
RUN npm run build

# Serve stage
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
