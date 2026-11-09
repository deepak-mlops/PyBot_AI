# Multi-stage Dockerfile for PyBot AI Full-Stack Platform
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install Python 3 in container for sandbox execution
RUN apk add --no-cache python3 py3-pip

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/server ./server
COPY --from=build /app/server.ts ./server.ts
COPY --from=build /app/src/types ./src/types
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
