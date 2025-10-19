#!/bin/bash

# Database Setup Script for Faceless Automation Platform
# This script initializes PostgreSQL database and runs migrations

set -e

echo "🚀 Setting up PostgreSQL database..."

# Load environment variables
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Default database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-faceless_automation}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

echo "📋 Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Check if PostgreSQL is running
echo ""
echo "🔍 Checking PostgreSQL service..."
if command -v pg_isready &> /dev/null; then
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" &> /dev/null; then
        echo "✅ PostgreSQL is running"
    else
        echo "❌ PostgreSQL is not running on $DB_HOST:$DB_PORT"
        echo ""
        echo "To install PostgreSQL on macOS:"
        echo "  brew install postgresql@14"
        echo "  brew services start postgresql@14"
        echo ""
        echo "To install on Ubuntu/Debian:"
        echo "  sudo apt-get install postgresql postgresql-contrib"
        echo "  sudo systemctl start postgresql"
        exit 1
    fi
else
    echo "⚠️  pg_isready not found - assuming PostgreSQL is running"
fi

# Create database if it doesn't exist
echo ""
echo "📦 Creating database '$DB_NAME' if it doesn't exist..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME"

echo "✅ Database '$DB_NAME' ready"

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
cd ..
pip3 install -r requirements.txt

# Run database migrations
echo ""
echo "🔄 Running database migrations..."
cd backend
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
alembic upgrade head

echo ""
echo "✅ Database setup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. Update .env with your database credentials"
echo "  2. Run: python3 -m backend.app.main"
echo "  3. API will be available at http://localhost:8000"
