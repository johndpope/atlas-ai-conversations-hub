#!/bin/bash

# Kill any existing Chrome instances with debugging enabled
pkill -f "remote-debugging-port=9222" || true

# Kill any processes using MCP inspector ports
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :3001 | xargs kill -9 2>/dev/null || true
lsof -ti :3002 | xargs kill -9 2>/dev/null || true
lsof -ti :3003 | xargs kill -9 2>/dev/null || true

# Start Chrome with debugging in background
echo "Starting Chrome with debugging enabled..."
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir=/tmp/chrome-debug \
  --no-first-run \
  --disable-default-apps \
  --disable-web-security \
  --disable-features=VizDisplayCompositor \
  --start-maximized \
  http://localhost:3000 &

  pnpm run dev:with-mock
