#!/bin/bash
cd /app || cd "$(dirname "$0")"
exec node dist/index.js

