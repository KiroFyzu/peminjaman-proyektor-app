// Camera functionality for peminjaman
let stream = null;
let isCameraOn = false;
let capturedImageData = null;

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const toggleBtn = document.getElementById('toggleCamera');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const cameraContainer = document.getElementById('cameraContainer');
const photoPreview = document.getElementById('photoPreview');
const capturedPhoto = document.getElementById('capturedPhoto');

// Toggle Camera On/Off
toggleBtn.addEventListener('click', async () => {
    if (!isCameraOn) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });
            
            video.srcObject = stream;
            cameraContainer.classList.remove('hidden');
            toggleBtn.innerHTML = '<i class="fas fa-power-off mr-2"></i>Matikan Kamera';
            toggleBtn.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
            toggleBtn.classList.add('bg-red-500', 'hover:bg-red-600');
            isCameraOn = true;
        } catch (error) {
            alert('❌ Tidak dapat mengakses kamera: ' + error.message);
            console.error('Camera error:', error);
        }
    } else {
        stopCamera();
    }
});

// Capture Photo
captureBtn.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    capturedImageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Show preview
    capturedPhoto.src = capturedImageData;
    photoPreview.classList.remove('hidden');
    
    // Show retake button, hide capture button
    captureBtn.classList.add('hidden');
    retakeBtn.classList.remove('hidden');
    
    // Stop camera
    stopCamera();
});

// Retake Photo
retakeBtn.addEventListener('click', async () => {
    // Hide preview
    photoPreview.classList.add('hidden');
    
    // Show capture button, hide retake button
    captureBtn.classList.remove('hidden');
    retakeBtn.classList.add('hidden');
    
    // Restart camera
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            }
        });
        
        video.srcObject = stream;
        cameraContainer.classList.remove('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-power-off mr-2"></i>Matikan Kamera';
        toggleBtn.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
        toggleBtn.classList.add('bg-red-500', 'hover:bg-red-600');
        isCameraOn = true;
    } catch (error) {
        alert('❌ Tidak dapat mengakses kamera: ' + error.message);
    }
});

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    video.srcObject = null;
    cameraContainer.classList.add('hidden');
    toggleBtn.innerHTML = '<i class="fas fa-camera mr-2"></i>Nyalakan Kamera';
    toggleBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
    toggleBtn.classList.add('bg-indigo-500', 'hover:bg-indigo-600');
    isCameraOn = false;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});
