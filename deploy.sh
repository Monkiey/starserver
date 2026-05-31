#!/bin/bash
# Secure production deployment for StarServer

echo "=== StarServer Production Deployment ==="
echo ""
echo "This script sets up your production environment securely."
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "Creating .env.production..."
    cat > .env.production << 'EOF'
NEXT_PUBLIC_APP_URL=https://starservers.dpdns.org
NEXT_PUBLIC_TMDB_TOKEN=YOUR_TMDB_API_KEY_HERE
NEXT_PUBLIC_SITE_NAME=StarServer
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
NEXT_PUBLIC_TWITTER=https://twitter.com/youraccount
NEXT_PUBLIC_FACEBOOK=https://facebook.com/youraccount
NEXT_PUBLIC_INSTAGRAM=https://instagram.com/youraccount
NEXT_PUBLIC_YOUTUBE=https://youtube.com/youraccount
EOF
    echo "✓ Created .env.production"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.production and replace YOUR_TMDB_API_KEY_HERE with your actual TMDB API key"
    echo ""
    echo "To get your TMDB API key:"
    echo "1. Visit https://www.themoviedb.org/settings/api"
    echo "2. Sign in or create an account"
    echo "3. Copy your API key (v3 auth)"
    echo "4. Paste it in .env.production as: NEXT_PUBLIC_TMDB_TOKEN=your_key_here"
    echo ""
fi

# Ensure .env.production is git-ignored
if ! grep -q ".env.production" .gitignore; then
    echo ".env.production" >> .gitignore
    git add .gitignore
    git commit -m "Add .env.production to gitignore"
fi

# Build and deploy
echo "Building Docker image..."
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build

echo ""
echo "✓ Deployment complete!"
echo ""
echo "Monitor logs with:"
echo "  docker compose -f docker-compose.production.yml logs -f app"
echo ""
echo "Check container status:"
echo "  docker ps"
echo ""
echo "If the container is crashing, verify your TMDB token in .env.production"
