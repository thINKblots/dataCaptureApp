// Global variables
let cameraStream = null;
let videoRecorder = null;
let audioRecorder = null;
let recordedChunks = [];
let capturedPhotos = [];
let capturedVideos = [];
let capturedAudio = [];

// Utility functions
function showStatus(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `status-message status-${type}`;
    element.style.display = 'block';

    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function addCapturedItem(listId, filename, type) {
    const list = document.getElementById(listId);
    const item = document.createElement('div');
    item.className = 'captured-item';
    item.textContent = `✓ ${filename}`;
    list.appendChild(item);
}

// Photo Capture
document.getElementById('startCamera').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });

        cameraStream = stream;
        const videoElement = document.getElementById('camera-preview');
        videoElement.srcObject = stream;
        videoElement.style.display = 'block';

        document.getElementById('startCamera').style.display = 'none';
        document.getElementById('capturePhoto').style.display = 'inline-block';
        document.getElementById('stopCamera').style.display = 'inline-block';

        showStatus('photo-status', 'Camera started successfully', 'success');
    } catch (err) {
        console.error('Error accessing camera:', err);
        showStatus('photo-status', 'Error accessing camera: ' + err.message, 'error');
    }
});

document.getElementById('capturePhoto').addEventListener('click', async () => {
    const videoElement = document.getElementById('camera-preview');
    const canvas = document.getElementById('photo-canvas');
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(videoElement, 0, 0);

    // Convert to blob and send to server
    canvas.toBlob(async (blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const base64data = reader.result;

            try {
                const response = await fetch('/api/save-photo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ photo: base64data })
                });

                const result = await response.json();

                if (result.success) {
                    capturedPhotos.push(result.path);
                    addCapturedItem('photo-list', result.filename, 'photo');
                    showStatus('photo-status', 'Photo captured successfully!', 'success');
                } else {
                    showStatus('photo-status', 'Error saving photo: ' + result.error, 'error');
                }
            } catch (err) {
                console.error('Error saving photo:', err);
                showStatus('photo-status', 'Error saving photo: ' + err.message, 'error');
            }
        };
    }, 'image/jpeg');
});

document.getElementById('stopCamera').addEventListener('click', () => {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        document.getElementById('camera-preview').style.display = 'none';
        document.getElementById('startCamera').style.display = 'inline-block';
        document.getElementById('capturePhoto').style.display = 'none';
        document.getElementById('stopCamera').style.display = 'none';
        showStatus('photo-status', 'Camera stopped', 'info');
    }
});

// Video Recording
document.getElementById('startVideo').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: true
        });

        recordedChunks = [];

        const options = { mimeType: 'video/webm;codecs=vp8,opus' };
        videoRecorder = new MediaRecorder(stream, options);

        videoRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        videoRecorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const formData = new FormData();
            formData.append('video', blob, 'recording.webm');

            try {
                const response = await fetch('/api/save-video', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    capturedVideos.push(result.path);
                    addCapturedItem('video-list', result.filename, 'video');
                    showStatus('video-status', 'Video saved successfully!', 'success');

                    // Show preview
                    const videoPreview = document.createElement('video');
                    videoPreview.src = URL.createObjectURL(blob);
                    videoPreview.controls = true;
                    videoPreview.style.maxWidth = '100%';
                    document.getElementById('video-preview-container').innerHTML = '';
                    document.getElementById('video-preview-container').appendChild(videoPreview);
                } else {
                    showStatus('video-status', 'Error saving video: ' + result.error, 'error');
                }
            } catch (err) {
                console.error('Error saving video:', err);
                showStatus('video-status', 'Error saving video: ' + err.message, 'error');
            }

            stream.getTracks().forEach(track => track.stop());
        };

        videoRecorder.start();

        // Create preview
        const videoPreview = document.createElement('video');
        videoPreview.srcObject = stream;
        videoPreview.autoplay = true;
        videoPreview.muted = true;
        videoPreview.style.maxWidth = '100%';
        document.getElementById('video-preview-container').innerHTML = '';
        document.getElementById('video-preview-container').appendChild(videoPreview);

        document.getElementById('startVideo').style.display = 'none';
        document.getElementById('stopVideo').style.display = 'inline-block';

        showStatus('video-status', 'Recording video...', 'info');
    } catch (err) {
        console.error('Error starting video recording:', err);
        showStatus('video-status', 'Error starting video: ' + err.message, 'error');
    }
});

document.getElementById('stopVideo').addEventListener('click', () => {
    if (videoRecorder && videoRecorder.state !== 'inactive') {
        videoRecorder.stop();
        document.getElementById('startVideo').style.display = 'inline-block';
        document.getElementById('stopVideo').style.display = 'none';
    }
});

// Audio Recording
document.getElementById('startAudio').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        recordedChunks = [];

        const options = { mimeType: 'audio/webm;codecs=opus' };
        audioRecorder = new MediaRecorder(stream, options);

        audioRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        audioRecorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');

            try {
                const response = await fetch('/api/save-audio', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    capturedAudio.push(result.path);
                    addCapturedItem('audio-list', result.filename, 'audio');
                    showStatus('audio-status', 'Audio saved successfully!', 'success');

                    // Show preview
                    const audioPreview = document.createElement('audio');
                    audioPreview.src = URL.createObjectURL(blob);
                    audioPreview.controls = true;
                    audioPreview.style.maxWidth = '100%';
                    document.getElementById('audio-preview-container').innerHTML = '';
                    document.getElementById('audio-preview-container').appendChild(audioPreview);
                } else {
                    showStatus('audio-status', 'Error saving audio: ' + result.error, 'error');
                }
            } catch (err) {
                console.error('Error saving audio:', err);
                showStatus('audio-status', 'Error saving audio: ' + err.message, 'error');
            }

            stream.getTracks().forEach(track => track.stop());
        };

        audioRecorder.start();

        document.getElementById('startAudio').style.display = 'none';
        document.getElementById('stopAudio').style.display = 'inline-block';

        showStatus('audio-status', 'Recording audio...', 'info');
    } catch (err) {
        console.error('Error starting audio recording:', err);
        showStatus('audio-status', 'Error starting audio: ' + err.message, 'error');
    }
});

document.getElementById('stopAudio').addEventListener('click', () => {
    if (audioRecorder && audioRecorder.state !== 'inactive') {
        audioRecorder.stop();
        document.getElementById('startAudio').style.display = 'inline-block';
        document.getElementById('stopAudio').style.display = 'none';
    }
});

// Submit All Data
document.getElementById('submitAll').addEventListener('click', async () => {
    const data = {
        service_type: document.getElementById('serviceType').value,
        equipment_id: document.getElementById('equipmentId').value,
        notes: document.getElementById('notes').value,
        photos: capturedPhotos,
        videos: capturedVideos,
        audio: capturedAudio
    };

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showStatus('submit-status', 'Service report submitted successfully! 🎉', 'success');

            // Reset form after successful submission
            setTimeout(() => {
                if (confirm('Report submitted! Would you like to start a new report?')) {
                    location.reload();
                }
            }, 2000);
        } else {
            showStatus('submit-status', 'Error submitting report: ' + result.error, 'error');
        }
    } catch (err) {
        console.error('Error submitting data:', err);
        showStatus('submit-status', 'Error submitting report: ' + err.message, 'error');
    }
});
