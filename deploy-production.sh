#!/bin/bash
# Production deployment setup for StarServer

# 1. Create .env.production file (never commit this to Git)
cat > .env.production << 'EOF'
NEXT_PUBLIC_APP_URL=https://starservers.dpdns.org
NEXT_PUBLIC_TMDB_TOKEN=your_actual_token_here
NEXT_PUBLIC_SITE_NAME=StarServer
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_TWITTER=https://twitter.com/youraccount
NEXT_PUBLIC_FACEBOOK=https://facebook.com/youraccount
NEXT_PUBLIC_INSTAGRAM=https://instagram.com/youraccount
NEXT_PUBLIC_YOUTUBE=https://youtube.com/youraccount
EOF

# Make sure it's not tracked by git
echo ".env.production" >> .gitignore

# 2. Create docker-compose.production.yml for production
cat > docker-compose.production.yml << 'EOF'
services:
  app:
    build:
      context: .
      args:
        NEXT_PUBLIC_APP_URL: https://starservers.dpdns.org
        NEXT_PUBLIC_TMDB_TOKEN: ${NEXT_PUBLIC_TMDB_TOKEN}
        NEXT_PUBLIC_SITE_NAME: StarServer
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
    restart: always
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - starserver-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  starserver-network:
    driver: bridge
EOF

echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.production and add your actual TMDB token and other real URLs"
echo "2. Run: docker compose -f docker-compose.production.yml up -d"
echo "3. Monitor logs: docker compose -f docker-compose.production.yml logs -f app"
