#!/bin/bash

# 📦 พอร์ตที่ต้องการ kill ก่อน dev
PORTS=(8000 5173 5174 3000)

echo "🔍 Checking ports: ${PORTS[*]}"

for PORT in "${PORTS[@]}"
do
  PID=$(lsof -t -i :$PORT)
  if [ -n "$PID" ]; then
    echo "🛑 Killing process on port $PORT (PID: $PID)"
    kill -9 $PID
  else
    echo "✅ Port $PORT is free"
  fi
done

echo "🚀 Starting dev server..."
npm run dev