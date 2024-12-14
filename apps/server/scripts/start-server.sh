#!/bin/bash

# Start dependencies
moon run rabbit:start
moon run monitoring:start
moon run mongodb:start

# Trap Ctrl+C
trap cleanup SIGINT

cleanup() {
  echo "Shutting down services..."
  moon run monitoring:stop
  moon run rabbit:stop
  moon run mongodb:stop
  exit 0
}

# Start the main application
nest start -w 