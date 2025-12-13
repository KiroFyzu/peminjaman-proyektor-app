// Camera functionality for pengembalian
let streamReturn = null;
let isCameraOnReturn = false;
let capturedImageDataReturn = null;
let currentFacingModeReturn = 'user'; // 'user' for front, 'environment' for back
let detectionIntervalReturn = null;

const videoReturn = document.getElementById('videoReturn');
const canvasReturn = document.getElementById('canvasReturn');
const toggleBtnReturn = document.getElementById('toggleCameraReturn');
const captureBtnReturn = document.getElementById('captureBtnReturn');
const retakeBtnReturn = document.getElementById('retakeBtnReturn');
const cameraContainerReturn = document.getElementById('cameraContainerReturn');
const photoPreviewReturn = document.getElementById('photoPreviewReturn');
const capturedPhotoReturn = document.getElementById('capturedPhotoReturn');

// Create flip camera button for return
const flipCameraBtnReturn = document.createElement('button');
flipCameraBtnReturn.type = 'button';
flipCameraBtnReturn.id = 'flipCameraBtnReturn';
flipCameraBtnReturn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Ganti Kamera';
flipCameraBtnReturn.className = 'flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition hidden';

// Create face detection status element for return
const faceDetectionStatusReturn = document.createElement('div');
faceDetectionStatusReturn.id = 'faceDetectionStatusReturn';
faceDetectionStatusReturn.className = 'hidden p-3 rounded-lg text-sm font-semibold flex items-center';

// Toggle Camera On/Off
toggleBtnReturn.addEventListener('click', async () => {
    if (!isCameraOnReturn) {
        try {
            // Load face detection models first
            await loadFaceDetectionModels();
            
            streamReturn = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: currentFacingModeReturn
                }
            });
            
            videoReturn.srcObject = streamReturn;
            cameraContainerReturn.classList.remove('hidden');
            
            // Add flip button and status to camera container
            if (!document.getElementById('flipCameraBtnReturn')) {
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'mt-4 flex gap-3';
                buttonContainer.appendChild(flipCameraBtnReturn);
                cameraContainerReturn.appendChild(buttonContainer);
                
                const statusContainer = document.createElement('div');
                statusContainer.appendChild(faceDetectionStatusReturn);
                cameraContainerReturn.appendChild(statusContainer);
            }
            
            flipCameraBtnReturn.classList.remove('hidden');
            toggleBtnReturn.innerHTML = '<i class="fas fa-power-off mr-2"></i>Matikan Kamera';
            toggleBtnReturn.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
            toggleBtnReturn.classList.add('bg-red-500', 'hover:bg-red-600');
            isCameraOnReturn = true;
            
            // Start real-time face detection
            startRealTimeFaceDetection(videoReturn, faceDetectionStatusReturn);
        } catch (error) {
            alert('❌ Tidak dapat mengakses kamera: ' + error.message);
            console.error('Camera error:', error);
        }
    } else {
        stopCameraReturn();
    }
});

// Flip Camera Button for Return
flipCameraBtnReturn.addEventListener('click', async () => {
    if (!isCameraOnReturn) return;
    
    try {
        // Stop current stream
        if (streamReturn) {
            streamReturn.getTracks().forEach(track => track.stop());
        }
        
        // Toggle facing mode
        currentFacingModeReturn = currentFacingModeReturn === 'user' ? 'environment' : 'user';
        
        // Get new stream with different camera
        streamReturn = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: currentFacingModeReturn
            }
        });
        
        videoReturn.srcObject = streamReturn;
        flipCameraBtnReturn.innerHTML = currentFacingModeReturn === 'user' 
            ? '<i class="fas fa-sync-alt mr-2"></i>Kamera Belakang' 
            : '<i class="fas fa-sync-alt mr-2"></i>Kamera Depan';
        
        // Restart face detection
        startRealTimeFaceDetection(videoReturn, faceDetectionStatusReturn);
        console.log(`✅ Switched to ${currentFacingModeReturn === 'user' ? 'front' : 'back'} camera`);
    } catch (error) {
        alert('❌ Tidak dapat mengganti kamera: ' + error.message);
        console.error('Camera flip error:', error);
    }
});

// Capture Photo
captureBtnReturn.addEventListener('click', async () => {
    try {
        const context = canvasReturn.getContext('2d');
        canvasReturn.width = videoReturn.videoWidth;
        canvasReturn.height = videoReturn.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(videoReturn, 0, 0, canvasReturn.width, canvasReturn.height);
        
        // Convert to base64
        capturedImageDataReturn = canvasReturn.toDataURL('image/jpeg', 0.8);
        
        // Show loading modal
        showDetectionLoadingModal();
        
        // Perform face detection on captured image
        const detectionResult = await detectFaceInImage(capturedImageDataReturn);
        
        // Hide loading modal
        hideDetectionLoadingModal();
        
        if (!detectionResult.detected) {
            showNotificationModal('⚠️ Validasi Wajah Gagal', 'Tidak ada wajah terdeteksi di foto ini!\n\nPastikan wajah Anda terlihat jelas di kamera. Silakan ambil foto ulang.', 'warning');
            return;
        }
        
        console.log(`✅ Photo captured with face detection confidence: ${(detectionResult.confidence * 100).toFixed(2)}%`);
        
        // Show preview
        capturedPhotoReturn.src = capturedImageDataReturn;
        photoPreviewReturn.classList.remove('hidden');
        
        // Add face detection badge
        const detectionBadge = document.createElement('div');
        detectionBadge.className = 'mt-3 p-3 bg-green-50 border border-green-300 rounded-lg flex items-center detection-badge';
        detectionBadge.innerHTML = `<i class="fas fa-check-circle text-green-500 mr-2"></i><span class="text-green-700 font-semibold">✓ Wajah terdeteksi (${(detectionResult.confidence * 100).toFixed(1)}%)</span>`;
        
        // Remove old badge if exists
        const oldBadge = photoPreviewReturn.querySelector('.detection-badge');
        if (oldBadge) oldBadge.remove();
        
        photoPreviewReturn.appendChild(detectionBadge);
        
        // Show retake button, hide capture button
        captureBtnReturn.classList.add('hidden');
        retakeBtnReturn.classList.remove('hidden');
        flipCameraBtnReturn.classList.add('hidden');
        
        // Stop camera
        stopCameraReturn();
    } catch (error) {
        hideDetectionLoadingModal();
        console.error('Error capturing photo:', error);
        showNotificationModal('❌ Error', 'Error capturing photo: ' + error.message, 'error');
    }
});

// Retake Photo
retakeBtnReturn.addEventListener('click', async () => {
    // Hide preview
    photoPreviewReturn.classList.add('hidden');
    
    // Show capture button, hide retake button
    captureBtnReturn.classList.remove('hidden');
    retakeBtnReturn.classList.add('hidden');
    flipCameraBtnReturn.classList.remove('hidden');
    
    // Restart camera
    try {
        streamReturn = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: currentFacingModeReturn
            }
        });
        
        videoReturn.srcObject = streamReturn;
        cameraContainerReturn.classList.remove('hidden');
        toggleBtnReturn.innerHTML = '<i class="fas fa-power-off mr-2"></i>Matikan Kamera';
        toggleBtnReturn.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
        toggleBtnReturn.classList.add('bg-red-500', 'hover:bg-red-600');
        isCameraOnReturn = true;
        
        // Restart face detection
        startRealTimeFaceDetection(videoReturn, faceDetectionStatusReturn);
    } catch (error) {
        alert('❌ Tidak dapat mengakses kamera: ' + error.message);
    }
});

function stopCameraReturn() {
    if (streamReturn) {
        streamReturn.getTracks().forEach(track => track.stop());
        streamReturn = null;
    }
    if (detectionIntervalReturn) {
        clearInterval(detectionIntervalReturn);
    }
    videoReturn.srcObject = null;
    cameraContainerReturn.classList.add('hidden');
    flipCameraBtnReturn.classList.add('hidden');
    faceDetectionStatusReturn.classList.add('hidden');
    toggleBtnReturn.innerHTML = '<i class="fas fa-camera mr-2"></i>Nyalakan Kamera';
    toggleBtnReturn.classList.remove('bg-red-500', 'hover:bg-red-600');
    toggleBtnReturn.classList.add('bg-indigo-500', 'hover:bg-indigo-600');
    isCameraOnReturn = false;
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
    if (streamReturn) {
        streamReturn.getTracks().forEach(track => track.stop());
    }
    if (detectionIntervalReturn) {
        clearInterval(detectionIntervalReturn);
    }
});
