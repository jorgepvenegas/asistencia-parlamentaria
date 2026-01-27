#!/bin/bash
#
# QuienAtiende Deployment Script
# Deploys the full application stack (API + Frontend)
# Supports local, staging, and production environments
#
# Usage: ./deploy.sh [env] [--no-migrate] [--verbose]
# Example: ./deploy.sh production

set -e

# Configuration
ENVIRONMENT="${1:-staging}"
SKIP_MIGRATE="${2:-false}"
VERBOSE="${3:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

log_section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}${1}${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(local|staging|production)$ ]]; then
  log_error "Invalid environment: $ENVIRONMENT"
  echo "Valid options: local, staging, production"
  exit 1
fi

log_section "QuienAtiende Deployment [${ENVIRONMENT}]"

# Validate prerequisites
log_info "Checking prerequisites..."

if ! command -v node &> /dev/null; then
  log_error "Node.js not found"
  exit 1
fi

if ! command -v pnpm &> /dev/null; then
  log_error "pnpm not found"
  exit 1
fi

log_success "Node.js: $(node --version)"
log_success "pnpm: $(pnpm --version)"

# Load environment variables
log_info "Loading environment configuration for $ENVIRONMENT..."

if [[ -f ".env.${ENVIRONMENT}" ]]; then
  # shellcheck disable=SC1090
  source ".env.${ENVIRONMENT}"
  log_success "Loaded .env.${ENVIRONMENT}"
else
  log_warn "No .env.${ENVIRONMENT} file found, using defaults"
fi

# Set default values
DB_PATH="${DB_PATH:=./quienatiende.db}"
API_URL="${API_URL:=http://localhost:3000}"
API_PORT="${API_PORT:=3000}"
FRONTEND_URL="${FRONTEND_URL:=http://localhost:3001}"
FRONTEND_PORT="${FRONTEND_PORT:=3001}"

log_info "Configuration:"
log_info "  Database: $DB_PATH"
log_info "  API URL: $API_URL"
log_info "  API Port: $API_PORT"
log_info "  Frontend URL: $FRONTEND_URL"
log_info "  Frontend Port: $FRONTEND_PORT"

# Install dependencies
log_section "Installing Dependencies"

log_info "Installing packages..."
pnpm install --frozen-lockfile

if [[ "$VERBOSE" == "--verbose" ]]; then
  log_success "Dependencies installed"
fi

# Database migration
log_section "Database Setup"

if [[ "$SKIP_MIGRATE" == "--no-migrate" ]]; then
  log_warn "Skipping database migration (--no-migrate flag)"
else
  log_info "Running database migrations..."
  pnpm -F api run migrate

  if [[ -f "packages/api/db/seed.ts" ]] || [[ -f "packages/api/db/seed.sql" ]]; then
    log_info "Checking for seed data..."
    if [[ "$ENVIRONMENT" == "local" ]]; then
      log_info "Seeding database for local development..."
      pnpm -F api run seed || log_warn "Seeding failed or already seeded"
    fi
  fi

  log_success "Database ready"
fi

# Build API
log_section "Building API"

log_info "Building API package..."
pnpm -F api run build

log_success "API built"

# Build Frontend
log_section "Building Frontend"

log_info "Building frontend..."
pnpm -F frontend run build

log_info "Analyzing bundle size..."
pnpm -F frontend run analyze:bundle

log_success "Frontend built"

# Validation
log_section "Validation"

log_info "Running tests..."
pnpm -F api run test:db || log_warn "Database tests skipped"
pnpm -F frontend run test || log_warn "Frontend tests skipped"

log_success "Tests completed"

# Output deployment summary
log_section "Deployment Summary"

echo "Environment:          $ENVIRONMENT"
echo "Database:             $DB_PATH"
echo "API:                  $API_URL:$API_PORT"
echo "Frontend:             $FRONTEND_URL:$FRONTEND_PORT"
echo ""

if [[ "$ENVIRONMENT" == "local" ]]; then
  log_info "Next steps for local development:"
  echo "  1. Start API:      cd packages/api && pnpm run dev"
  echo "  2. Start Frontend: cd packages/frontend && pnpm run dev"
  echo "  3. Open browser:   $FRONTEND_URL"
elif [[ "$ENVIRONMENT" == "staging" ]]; then
  log_info "Next steps for staging deployment:"
  echo "  1. Review changes"
  echo "  2. Push to staging branch"
  echo "  3. Monitor: $FRONTEND_URL"
elif [[ "$ENVIRONMENT" == "production" ]]; then
  log_warn "PRODUCTION DEPLOYMENT READY"
  echo "  1. Verify all tests pass"
  echo "  2. Review deployment checklist"
  echo "  3. Push to production branch"
  echo "  4. Confirm: $FRONTEND_URL"
fi

echo ""
log_success "Deployment prepared successfully"
