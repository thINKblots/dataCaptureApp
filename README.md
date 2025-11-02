# Service Technician Data Capture App

A modern, user-friendly web application for service technicians to capture and document service calls with photos, videos, audio recordings, and structured text data.

## Features

- **Photo Capture**: Take photos directly from your device's camera
- **Video Recording**: Record video with audio for detailed documentation
- **Audio Recording**: Capture voice notes and audio annotations
- **Structured Forms**: Fill out service details including:
  - Service type (Installation, Repair, Maintenance, Inspection, Emergency, Other)
  - Equipment ID/Model
  - Detailed service notes

## Installation

1. Install Python 3.8 or higher

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the Flask server:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

3. For mobile access on the same network, use your computer's IP address:
```
http://YOUR_IP_ADDRESS:5000
```

## Usage

### Taking Photos
1. Click "Start Camera" to activate your device's camera
2. Click "Take Photo" to capture an image
3. Photos are automatically saved
4. Click "Stop Camera" when finished

### Recording Video
1. Click "Start Recording" to begin video capture
2. The app will record video and audio
3. Click "Stop Recording" when finished
4. Video is automatically saved and a preview is shown

### Recording Audio
1. Click "Start Recording" to begin audio capture
2. Speak into your device's microphone
3. Click "Stop Recording" when finished
4. Audio is automatically saved and a playback control is shown

### Filling Out Service Information
1. Select a service type from the dropdown
2. Add equipment ID or model information
3. Add detailed notes in the Service Notes text area

### Submitting the Report
1. After capturing all necessary media and filling out the form
2. Click "Submit Service Report"
3. All data will be saved to the server
4. You'll be prompted to start a new report

## Data Storage

- **Media Files**: Stored in the `uploads/` directory
  - Photos: `uploads/photos/`
  - Videos: `uploads/videos/`
  - Audio: `uploads/audio/`

- **Metadata**: Stored as JSON files in the `data/` directory
  - Each submission creates a timestamped JSON file
  - Contains form data and references to media files

## Browser Compatibility

Works best with modern browsers that support:
- MediaStream API (for camera/microphone access)
- MediaRecorder API (for recording)
- WebRTC

Recommended browsers:
- Chrome/Edge (Desktop & Mobile)
- Safari (Desktop & Mobile)
- Firefox (Desktop & Mobile)

## Security Notes

For production use, consider adding:
- User authentication
- HTTPS encryption
- File upload size limits (currently 500MB)
- File type validation
- Data backup systems
- Access control for sensitive data

## Mobile Usage

The app is fully responsive and works great on mobile devices:
- Use your phone's rear camera for better quality photos
- Portrait or landscape orientation supported
- Touch-friendly interface
- Works offline-first (with future service worker implementation)

## Troubleshooting

**Camera/Microphone not working:**
- Ensure you've granted permission when prompted
- Check browser settings for camera/microphone access
- HTTPS is required for camera access on some browsers

**Large file uploads failing:**
- Check available disk space
- Reduce video recording length
- Check MAX_CONTENT_LENGTH in app.py

**Cannot access from mobile device:**
- Ensure both devices are on the same network
- Check firewall settings
- Use the computer's local IP address, not localhost

## Future Enhancements

Potential features to add:
- GPS location tagging
- Offline mode with sync
- Data export to PDF/CSV
- Integration with service management systems
- User authentication and multi-tenant support
- Cloud storage integration
- Real-time collaboration
- Image annotation tools
