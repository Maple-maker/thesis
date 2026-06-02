#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20.20.2 > /dev/null 2>&1
lsof -ti :8081 | xargs kill -9 2>/dev/null
sleep 1
npx expo start --ios --lan 2>&1
