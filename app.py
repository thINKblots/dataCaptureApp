from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from datetime import datetime
import json
import base64

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
DATA_FOLDER = 'data'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'webm', 'wav', 'mp3', 'ogg'}

# Create necessary directories
for folder in [UPLOAD_FOLDER, DATA_FOLDER,
               f'{UPLOAD_FOLDER}/photos',
               f'{UPLOAD_FOLDER}/videos',
               f'{UPLOAD_FOLDER}/audio']:
    os.makedirs(folder, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_metadata(data):
    """Save submission metadata to JSON file"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'{DATA_FOLDER}/submission_{timestamp}.json'
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    return filename

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/save-photo', methods=['POST'])
def save_photo():
    try:
        data = request.json
        photo_data = data.get('photo')

        if not photo_data:
            return jsonify({'error': 'No photo data'}), 400

        # Remove data URL prefix
        if ',' in photo_data:
            photo_data = photo_data.split(',')[1]

        # Decode base64 image
        image_bytes = base64.b64decode(photo_data)

        # Save with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        filename = f'photo_{timestamp}.jpg'
        filepath = os.path.join(UPLOAD_FOLDER, 'photos', filename)

        with open(filepath, 'wb') as f:
            f.write(image_bytes)

        return jsonify({
            'success': True,
            'filename': filename,
            'path': f'photos/{filename}'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-video', methods=['POST'])
def save_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file'}), 400

        file = request.files['video']

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        filename = f'video_{timestamp}.webm'
        filepath = os.path.join(UPLOAD_FOLDER, 'videos', filename)

        file.save(filepath)

        return jsonify({
            'success': True,
            'filename': filename,
            'path': f'videos/{filename}'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-audio', methods=['POST'])
def save_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file'}), 400

        file = request.files['audio']

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        filename = f'audio_{timestamp}.webm'
        filepath = os.path.join(UPLOAD_FOLDER, 'audio', filename)

        file.save(filepath)

        return jsonify({
            'success': True,
            'filename': filename,
            'path': f'audio/{filename}'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/submit', methods=['POST'])
def submit_data():
    try:
        data = request.json

        # Add timestamp
        data['timestamp'] = datetime.now().isoformat()

        # Save metadata
        metadata_file = save_metadata(data)

        return jsonify({
            'success': True,
            'message': 'Data submitted successfully',
            'metadata_file': metadata_file
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/submissions', methods=['GET'])
def get_submissions():
    try:
        submissions = []
        for filename in os.listdir(DATA_FOLDER):
            if filename.endswith('.json'):
                with open(os.path.join(DATA_FOLDER, filename), 'r') as f:
                    submissions.append(json.load(f))

        # Sort by timestamp, newest first
        submissions.sort(key=lambda x: x.get('timestamp', ''), reverse=True)

        return jsonify(submissions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
