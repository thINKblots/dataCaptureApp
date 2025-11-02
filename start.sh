#!/bin/bash

echo "🔧 Service Technician Data Capture App"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Get local IP address
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Access the app at:"
echo "   Local:   http://localhost:5000"
if [ ! -z "$LOCAL_IP" ]; then
    echo "   Network: http://$LOCAL_IP:5000"
fi
echo ""
echo "📱 Use the Network URL to access from mobile devices on the same network"
echo ""
echo "🚀 Starting server..."
echo ""

# Run the app
python app.py
