# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app with environment variables passed as build args
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_TMDB_TOKEN
ARG NEXT_PUBLIC_SITE_NAME

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_TMDB_TOKEN=$NEXT_PUBLIC_TMDB_TOKEN
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV SKIP_ENV_VALIDATION=true

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install next globally
RUN npm install -g next

# Copy package.json from builder
COPY --from=builder /app/package*.json ./

# Copy built Next.js app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set production environment
ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["next", "start"]
