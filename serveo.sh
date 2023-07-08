#!/bin/bash

# Load environment variables from .env file
set -a
[ -f .env ] && . .env
set +a

serveo_url=$TWILIO_WEBHOOK_SERVEO_URL
echo "Starting serveo with domain: $serveo_url"
# Start serveo with the specified domain
ssh -R $serveo_url:80:localhost:3000 serveo.net  