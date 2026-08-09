#!/bin/bash
set -e

echo "=== PSITS Web Docker Health Check ==="
echo ""

# ── Colors ──────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

pass() { echo -e "${GREEN}PASS${NC}: $1"; }
fail() { echo -e "${RED}FAIL${NC}: $1"; docker compose down 2>/dev/null; exit 1; }

# ── Test 1: Build ───────────────────────────────────────
echo "Test 1: Docker build"
if docker compose build --quiet 2>&1; then
  pass "Images built successfully"
else
  fail "Build failed"
fi

# ── Test 2: Server starts and responds ─────────────────
echo ""
echo "Test 2: Server starts"
docker compose up -d server
sleep 20

HEALTH_RESPONSE=$(curl -sf http://localhost:5000/health 2>/dev/null || true)
if [ -z "$HEALTH_RESPONSE" ]; then
  fail "Server /health did not respond"
fi

if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
  pass "Server /health returns {status: ok}"
else
  fail "Unexpected /health response: $HEALTH_RESPONSE"
fi

HEALTH_TIMESTAMP=$(echo "$HEALTH_RESPONSE" | grep -o '"timestamp":"[^"]*"' | head -1)
if [ -z "$HEALTH_TIMESTAMP" ]; then
  fail "/health response missing timestamp"
fi
pass "Health endpoint includes timestamp"

# ── Test 3: Hot reload ─────────────────────────────────
echo ""
echo "Test 3: Hot reload"

OLD_TIMESTAMP=$(echo "$HEALTH_RESPONSE" | grep -o '"timestamp":"[^"]*"' | cut -d'"' -f4)

# Touch a source file to trigger nodemon restart
touch server-side/src/index.ts
sleep 8

NEW_RESPONSE=$(curl -sf http://localhost:5000/health 2>/dev/null || true)
if [ -z "$NEW_RESPONSE" ]; then
  fail "Server unreachable after touch (hot reload may have failed)"
fi

NEW_TIMESTAMP=$(echo "$NEW_RESPONSE" | grep -o '"timestamp":"[^"]*"' | cut -d'"' -f4)

if [ "$OLD_TIMESTAMP" != "$NEW_TIMESTAMP" ]; then
  pass "Timestamp changed after source touch — hot reload working"
else
  fail "Timestamp unchanged after source touch — hot reload may not be working"
fi

# ── Cleanup ─────────────────────────────────────────────
echo ""
docker compose down
echo ""
echo -e "${GREEN}All tests passed.${NC}"
