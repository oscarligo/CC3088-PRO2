# Base stage
FROM node:20-slim AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Development Stage

FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev", "--", "--host"]

# Build Stage for production
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
