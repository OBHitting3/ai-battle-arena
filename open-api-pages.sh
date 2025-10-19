#!/bin/bash

# Open all API key pages in browser

echo "🔑 Opening API key pages in your browser..."

# Critical keys
open "https://console.anthropic.com/"
sleep 1
open "https://platform.openai.com/api-keys"

# Optional keys
sleep 1
open "https://aistudio.google.com/app/apikey"
sleep 1
open "https://www.perplexity.ai/settings/api"

echo ""
echo "✅ Opened all API key pages in your browser"
echo ""
echo "📝 Get your keys and add them to:"
echo "   ~/faceless-automation-platform/.env"
echo ""
echo "🚀 Then run:"
echo "   cd ~/faceless-automation-platform"
echo "   npm run test:casper:single"
echo ""
