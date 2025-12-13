// Face Detection Module menggunakan face-api.js
let faceDetectionModelsLoaded = false;
let isFaceDetected = false;

// Load face-api models
async function loadFaceDetectionModels() {
    try {
        if (faceDetectionModelsLoaded) return;
        
        console.log('🔄 Loading face detection models...');
        
        // Load models dari CDN
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
        ]);
        
        faceDetectionModelsLoaded = true;
        console.log('✅ Face detection models loaded successfully');
    } catch (error) {
        console.error('❌ Error loading face detection models:', error);
        throw error;
    }
}

// Detect face in video stream
async function detectFaceInVideo(videoElement) {
    if (!videoElement || !videoElement.srcObject) {
        console.log('⚠️ Video element not ready');
        return false;
    }
    
    try {
        const options = new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 416, 
            scoreThreshold: 0.5 
        });
        
        const detections = await faceapi
            .detectAllFaces(videoElement, options)
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();
        
        // Ensure at least one face detected with high confidence
        const hasFace = detections && detections.length > 0;
        
        if (hasFace) {
            const detection = detections[0];
            const score = detection.detection.score;
            
            console.log(`✅ Face detected with confidence: ${(score * 100).toFixed(2)}%`);
            console.log('Age:', detection.age.toFixed(1), 'years');
            console.log('Gender:', detection.gender, 'Probability:', (detection.genderProbability * 100).toFixed(2) + '%');
            
            // Mark as face detected if confidence > 70%
            if (score > 0.7) {
                isFaceDetected = true;
                return true;
            }
        } else {
            console.log('⚠️ No face detected in video');
            isFaceDetected = false;
        }
        
        return false;
    } catch (error) {
        console.error('Error detecting face:', error);
        return false;
    }
}

// Detect face in captured image
async function detectFaceInImage(imageBase64) {
    try {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    const options = new faceapi.TinyFaceDetectorOptions({ 
                        inputSize: 416, 
                        scoreThreshold: 0.5 
                    });
                    
                    const detections = await faceapi
                        .detectAllFaces(img, options)
                        .withFaceLandmarks()
                        .withFaceExpressions()
                        .withAgeAndGender();
                    
                    const hasFace = detections && detections.length > 0;
                    
                    if (hasFace) {
                        const detection = detections[0];
                        const score = detection.detection.score;
                        
                        console.log(`✅ Face detected in image with confidence: ${(score * 100).toFixed(2)}%`);
                        
                        if (score > 0.7) {
                            resolve({
                                detected: true,
                                confidence: score,
                                detection: detection
                            });
                            return;
                        }
                    }
                    
                    console.log('⚠️ No valid face detected in captured image');
                    resolve({
                        detected: false,
                        confidence: 0,
                        detection: null
                    });
                } catch (error) {
                    console.error('Error in face detection:', error);
                    resolve({
                        detected: false,
                        confidence: 0,
                        detection: null
                    });
                }
            };
            
            img.onerror = () => {
                console.error('Error loading image');
                resolve({
                    detected: false,
                    confidence: 0,
                    detection: null
                });
            };
            
            img.src = imageBase64;
        });
    } catch (error) {
        console.error('Error detecting face in image:', error);
        return {
            detected: false,
            confidence: 0,
            detection: null
        };
    }
}

// Real-time face detection with visual feedback
async function startRealTimeFaceDetection(videoElement, statusElement) {
    if (!videoElement.srcObject) {
        console.log('⚠️ Video not ready for face detection');
        return;
    }
    
    try {
        // Load models if not already loaded
        if (!faceDetectionModelsLoaded) {
            if (statusElement) {
                statusElement.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading face detection...';
                statusElement.classList.remove('hidden');
            }
            await loadFaceDetectionModels();
        }
        
        // Create options once
        const options = new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 416, 
            scoreThreshold: 0.5 
        });
        
        // Start detection loop
        const detectionLoop = async () => {
            if (!videoElement.srcObject) {
                console.log('Video stream stopped');
                return;
            }
            
            try {
                const detections = await faceapi
                    .detectAllFaces(videoElement, options)
                    .withFaceLandmarks()
                    .withFaceExpressions()
                    .withAgeAndGender();
                
                const hasFace = detections && detections.length > 0;
                
                if (statusElement) {
                    if (hasFace) {
                        statusElement.innerHTML = '<i class="fas fa-check-circle text-green-500 mr-2"></i><span class="text-green-600 font-semibold">✓ Wajah terdeteksi</span>';
                        statusElement.classList.add('bg-green-50', 'border', 'border-green-300');
                        statusElement.classList.remove('bg-yellow-50', 'border-yellow-300', 'hidden');
                    } else {
                        statusElement.innerHTML = '<i class="fas fa-exclamation-circle text-yellow-500 mr-2"></i><span class="text-yellow-600 font-semibold">⚠ Posisikan wajah ke kamera</span>';
                        statusElement.classList.add('bg-yellow-50', 'border', 'border-yellow-300');
                        statusElement.classList.remove('bg-green-50', 'border-green-300', 'hidden');
                    }
                }
            } catch (detectionError) {
                console.warn('Detection error:', detectionError);
            }
            
            // Continue detection loop
            if (videoElement.srcObject && videoElement.srcObject.active) {
                requestAnimationFrame(detectionLoop);
            }
        };
        
        detectionLoop();
    } catch (error) {
        console.error('Error starting face detection:', error);
        if (statusElement) {
            statusElement.innerHTML = '<i class="fas fa-times-circle text-red-500 mr-2"></i><span class="text-red-600">Error loading face detection</span>';
            statusElement.classList.remove('hidden');
        }
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadFaceDetectionModels,
        detectFaceInVideo,
        detectFaceInImage,
        startRealTimeFaceDetection,
        isFaceDetected: () => isFaceDetected
    };
}
