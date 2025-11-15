// Camera functionality for pengembalian
let streamReturn = null;
let isCameraOnReturn = false;
let capturedImageDataReturn = null;

const videoReturn = document.getElementById('videoReturn');
const canvasReturn = document.getElementById('canvasReturn');
const toggleBtnReturn = document.getElementById('toggleCameraReturn');
const captureBtnReturn = document.getElementById('captureBtnReturn');
const retakeBtnReturn = document.getElementById('retakeBtnReturn');
const cameraContainerReturn = document.getElementById('cameraContainerReturn');
const photoPreviewReturn = document.getElementById('photoPreviewReturn');
const capturedPhotoReturn = document.getElementById('capturedPhotoReturn');

// Toggle Camera On/Off
toggleBtnReturn.addEventListener('click', async () => {
    if (!isCameraOnReturn) {
        try {
            streamReturn = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });
            
            videoReturn.srcObject = streamReturn;
            cameraContainerReturn.classList.remove('hidden');
            toggleBtnReturn.innerHTML = '<i class="fas fa-power-off mr-2"></i>Matikan Kamera';
            toggleBtnReturn.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
            toggleBtnReturn.classList.add('bg-red-500', 'hover:bg-red-600');
            isCameraOnReturn = true;
        } catch (error) {
            alert('❌ Tidak dapat mengakses kamera: ' + error.message);
            console.error('Camera error:', error);
        }
    } else {
        stopCameraReturn();
    }
});

// Capture Photo
captureBtnReturn.addEventListener('click', () => {
    const context = canvasReturn.getContext('2d');
    canvasReturn.width = videoReturn.videoWidth;
    canvasReturn.height = videoReturn.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(videoReturn, 0, 0, canvasReturn.width, canvasReturn.height);
    
    // Convert to base64
    capturedImageDataReturn = canvasReturn.toDataURL('image/jpeg', 0.8);
    
    // Show preview
    capturedPhotoReturn.src = capturedImageDataReturn;
    photoPreviewReturn.classList.remove('hidden');
    
    // Show retake button, hide capture button
    captureBtnReturn.classList.add('hidden');
    retakeBtnReturn.classList.remove('hidden');
    
    // Stop camera
    stopCameraReturn();
});

// Retake Photo
retakeBtnReturn.addEventListener('click', async () => {
    // Hide preview
    photoPreviewReturn.classList.add('hidden');
    
    // Show capture button, hide retake button
    captureBtnReturn.classList.remove('hidden');
    retakeBtnReturn.classList.add('hidden');
    
    // Restart camera
    try {
        streamReturn = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            }
        });
        
        videoReturn.srcObject = streamReturn;
        cameraContainerReturn.classList.remove('hidden');
        toggleBtnReturn.innerHTML = '<i class="fas fa-power-off mr-2"></i>Matikan Kamera';
        toggleBtnReturn.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
        toggleBtnReturn.classList.add('bg-red-500', 'hover:bg-red-600');
        isCameraOnReturn = true;
    } catch (error) {
        alert('❌ Tidak dapat mengakses kamera: ' + error.message);
    }
});

function stopCameraReturn() {
    if (streamReturn) {
        streamReturn.getTracks().forEach(track => track.stop());
        streamReturn = null;
    }
    videoReturn.srcObject = null;
    cameraContainerReturn.classList.add('hidden');
    toggleBtnReturn.innerHTML = '<i class="fas fa-camera mr-2"></i>Nyalakan Kamera';
    toggleBtnReturn.classList.remove('bg-red-500', 'hover:bg-red-600');
    toggleBtnReturn.classList.add('bg-indigo-500', 'hover:bg-indigo-600');
    isCameraOnReturn = false;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (streamReturn) {
        streamReturn.getTracks().forEach(track => track.stop());
    }
});
