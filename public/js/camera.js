// Camera functionality for peminjaman
let stream = null;
let isCameraOn = false;
let capturedImageData = null;
let currentFacingMode = 'user'; // 'user' for front, 'environment' for back
let detectionInterval = null;

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const toggleBtn = document.getElementById('toggleCamera');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const cameraContainer = document.getElementById('cameraContainer');
const photoPreview = document.getElementById('photoPreview');
const capturedPhoto = document.getElementById('capturedPhoto');

// Create flip camera button
const flipCameraBtn = document.createElement('button');
flipCameraBtn.type = 'button';
flipCameraBtn.id = 'flipCameraBtn';
flipCameraBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Ganti Kamera';
flipCameraBtn.className = 'flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition hidden';

// Create face detection status element
const faceDetectionStatus = document.createElement('div');
faceDetectionStatus.id = 'faceDetectionStatus';
faceDetectionStatus.className = 'hidden p-3 rounded-lg text-sm font-semibold flex items-center';

// Toggle Camera On/Off
toggleBtn.addEventListener('click', async () => {
    if (!isCameraOn) {
        try {
            // Load face detection models first
            await loadFaceDetectionModels();
            
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: currentFacingMode
                }
            });
            
            video.srcObject = stream;
            cameraContainer.classList.remove('hidden');
            
            // Add flip button and status to camera container
            if (!document.getElementById('flipCameraBtn')) {
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'mt-4 flex gap-3';
                buttonContainer.appendChild(flipCameraBtn);
                cameraContainer.appendChild(buttonContainer);
                
                const statusContainer = document.createElement('div');
                statusContainer.appendChild(faceDetectionStatus);
                cameraContainer.appendChild(statusContainer);
            }
            
            flipCameraBtn.classList.remove('hidden');
            toggleBtn.innerHTML = '<i class="fas fa-power-off mr-2"></i>Matikan Kamera';
            toggleBtn.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
            toggleBtn.classList.add('bg-red-500', 'hover:bg-red-600');
            isCameraOn = true;
            
            // Start real-time face detection
            startRealTimeFaceDetection(video, faceDetectionStatus);
        } catch (error) {
            alert('❌ Tidak dapat mengakses kamera: ' + error.message);
            console.error('Camera error:', error);
        }
    } else {
        stopCamera();
    }
});

// Flip Camera Button
flipCameraBtn.addEventListener('click', async () => {
    if (!isCameraOn) return;
    
    try {
        // Stop current stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        // Toggle facing mode
        currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
        
        // Get new stream with different camera
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: currentFacingMode
            }
        });
        
        video.srcObject = stream;
        flipCameraBtn.innerHTML = currentFacingMode === 'user' 
            ? '<i class="fas fa-sync-alt mr-2"></i>Kamera Belakang' 
            : '<i class="fas fa-sync-alt mr-2"></i>Kamera Depan';
        
        // Restart face detection
        startRealTimeFaceDetection(video, faceDetectionStatus);
        console.log(`✅ Switched to ${currentFacingMode === 'user' ? 'front' : 'back'} camera`);
    } catch (error) {
        alert('❌ Tidak dapat mengganti kamera: ' + error.message);
        console.error('Camera flip error:', error);
    }
});

// Capture Photo
captureBtn.addEventListener('click', async () => {
    try {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        capturedImageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Show loading modal
        showDetectionLoadingModal();
        
        // Perform face detection on captured image
        const detectionResult = await detectFaceInImage(capturedImageData);
        
        // Hide loading modal
        hideDetectionLoadingModal();
        
        if (!detectionResult.detected) {
            showNotificationModal('⚠️ Validasi Wajah Gagal', 'Tidak ada wajah terdeteksi di foto ini!\n\nPastikan wajah Anda terlihat jelas di kamera. Silakan ambil foto ulang.', 'warning');
            return;
        }
        
        console.log(`✅ Photo captured with face detection confidence: ${(detectionResult.confidence * 100).toFixed(2)}%`);
        
        // Show preview
        capturedPhoto.src = capturedImageData;
        photoPreview.classList.remove('hidden');
        
        // Add face detection badge
        const detectionBadge = document.createElement('div');
        detectionBadge.className = 'mt-3 p-3 bg-green-50 border border-green-300 rounded-lg flex items-center';
        detectionBadge.innerHTML = `<i class="fas fa-check-circle text-green-500 mr-2"></i><span class="text-green-700 font-semibold">✓ Wajah terdeteksi (${(detectionResult.confidence * 100).toFixed(1)}%)</span>`;
        
        // Remove old badge if exists
        const oldBadge = photoPreview.querySelector('.detection-badge');
        if (oldBadge) oldBadge.remove();
        
        detectionBadge.className += ' detection-badge';
        photoPreview.appendChild(detectionBadge);
        
        // Show retake button, hide capture button
        captureBtn.classList.add('hidden');
        retakeBtn.classList.remove('hidden');
        flipCameraBtn.classList.add('hidden');
        
        // Stop camera
        stopCamera();
    } catch (error) {
        hideDetectionLoadingModal();
        console.error('Error capturing photo:', error);
        showNotificationModal('❌ Error', 'Error capturing photo: ' + error.message, 'error');
    }
});

// Retake Photo
retakeBtn.addEventListener('click', async () => {
    // Hide preview
    photoPreview.classList.add('hidden');
    
    // Show capture button, hide retake button
    captureBtn.classList.remove('hidden');
    retakeBtn.classList.add('hidden');
    flipCameraBtn.classList.remove('hidden');
    
    // Restart camera
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: currentFacingMode
            }
        });
        
        video.srcObject = stream;
        cameraContainer.classList.remove('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-power-off mr-2"></i>Matikan Kamera';
        toggleBtn.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
        toggleBtn.classList.add('bg-red-500', 'hover:bg-red-600');
        isCameraOn = true;
        
        // Restart face detection
        startRealTimeFaceDetection(video, faceDetectionStatus);
    } catch (error) {
        alert('❌ Tidak dapat mengakses kamera: ' + error.message);
    }
});

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    if (detectionInterval) {
        clearInterval(detectionInterval);
    }
    video.srcObject = null;
    cameraContainer.classList.add('hidden');
    flipCameraBtn.classList.add('hidden');
    faceDetectionStatus.classList.add('hidden');
    toggleBtn.innerHTML = '<i class="fas fa-camera mr-2"></i>Nyalakan Kamera';
    toggleBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
    toggleBtn.classList.add('bg-indigo-500', 'hover:bg-indigo-600');
    isCameraOn = false;
}

// Helper functions for modals
function showDetectionLoadingModal() {
    let modal = document.getElementById('detectionLoadingModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'detectionLoadingModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto mb-4"></div>
                <p class="text-gray-700 font-semibold">🔍 Mendeteksi wajah...</p>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
}

function hideDetectionLoadingModal() {
    const modal = document.getElementById('detectionLoadingModal');
    if (modal) modal.classList.add('hidden');
}

function showNotificationModal(title, message, type = 'success') {
    let modal = document.getElementById('notificationModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'notificationModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        document.body.appendChild(modal);
    }
    
    const icon = {
        'success': '<i class="fas fa-check-circle text-green-500 text-4xl mb-4"></i>',
        'error': '<i class="fas fa-times-circle text-red-500 text-4xl mb-4"></i>',
        'warning': '<i class="fas fa-exclamation-circle text-yellow-500 text-4xl mb-4"></i>',
        'info': '<i class="fas fa-info-circle text-blue-500 text-4xl mb-4"></i>'
    };
    
    const bgColor = {
        'success': 'bg-green-50',
        'error': 'bg-red-50',
        'warning': 'bg-yellow-50',
        'info': 'bg-blue-50'
    };
    
    modal.innerHTML = `
        <div class="${bgColor[type]} rounded-lg p-8 text-center max-w-md w-full shadow-2xl">
            ${icon[type]}
            <h3 class="text-xl font-bold text-gray-800 mb-3">${title}</h3>
            <p class="text-gray-700 mb-6 whitespace-pre-wrap">${message}</p>
            <button onclick="document.getElementById('notificationModal').classList.add('hidden')" 
                class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg transition">
                Tutup
            </button>
        </div>
    `;
    modal.classList.remove('hidden');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (detectionInterval) {
        clearInterval(detectionInterval);
    }
});
