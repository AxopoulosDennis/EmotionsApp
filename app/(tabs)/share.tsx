import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState(false); // Media Library permission state
  const [isRecording, setIsRecording] = useState(false); // To track if video is recording
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined); // To store captured photo URI
  const cameraRef = useRef<CameraView | null>(null); // Reference to the CameraView
  const tabBarHeight = useBottomTabOverflow();
  const lastTap = useRef<number | null>(null); // To track the last tap time
  const [countdown, setCountdown] = useState(60); // Countdown starting from 60 seconds
  const countdownRef = useRef(countdown); // Ref to store the countdown in real time

  const intervalRef = useRef<NodeJS.Timeout | null>(null); // To store interval ID

  const progressBarWidth = useRef(new Animated.Value(1)).current; // Animated value for the progress bar

  useEffect(() => {
    // Request media library permission on mount
    const requestPermissions = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryPermission(status === 'granted');
    };

    requestPermissions();

    // Cleanup the interval if the component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!cameraPermission) {
    return <View />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestCameraPermission} title="Grant Permission" />
      </View>
    );
  }

  if (mediaLibraryPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the media library</Text>
        <Button onPress={() => MediaLibrary.requestPermissionsAsync()} title="Grant Permission" />
      </View>
    );
  }


  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      toggleCameraFacing();
    } else {
      lastTap.current = now;
    }
  };

  // Function to capture a photo
  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo?.uri); // Save the photo URI
      console.log('Photo captured:', photo?.uri);

      // Save the captured photo to the media library
      if (photo.uri && mediaLibraryPermission) {
        try {
          const asset = await MediaLibrary.createAssetAsync(photo.uri);
          await MediaLibrary.createAlbumAsync('Camera', asset, false); // 'Camera' album, false = don't overwrite
          console.log('Photo saved to Media Library');
        } catch (error) {
          console.error('Error saving photo:', error);
        }
      }
    }
  };

  // Start recording and countdown
  const handlePressIn = async () => {
    if (cameraRef.current) {
      // Reset countdown and progress bar before starting a new recording
      setIsRecording(true);
      setCountdown(60); // Reset countdown to 60 seconds
      countdownRef.current = 60; // Initialize countdownRef

      // Clear any existing interval to prevent multiple intervals running at once
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Start video recording
      const videoRecordPromise = cameraRef.current.recordAsync();

      // Start countdown and update the progress bar
      intervalRef.current = setInterval(() => {
        countdownRef.current = countdownRef.current - 1;

        // Update the progress bar width as countdown decreases
        const progress = countdownRef.current / 60; // Calculate progress as a fraction

        if (countdownRef.current <= 0) {
          clearInterval(intervalRef.current!); // Stop the countdown
          stopRecording(); // Stop recording after countdown reaches 0
        }

        // Trigger a re-render
        setCountdown(countdownRef.current);
      }, 1000); // Decrease every second

      const videoData = await videoRecordPromise;
      if (videoData.uri && mediaLibraryPermission) {
        try {
          let asset = await MediaLibrary.createAssetAsync(videoData.uri);
          await MediaLibrary.createAlbumAsync('Camera', asset, false); // Save the video to the Camera album
          console.log('Video saved to Media Library');
        } catch (error) {
          console.error('Error saving video:', error);
        }
      }
    }
  };

  // Stop recording manually or after 60 seconds
  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      setIsRecording(false);
      await cameraRef.current.stopRecording(); // Stop recording
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // Clear the interval
      }

      // Reset progress bar width to 100% after recording stops
    }
  };

  const handlePressOut = async () => {
    if (cameraRef.current && isRecording) {
      setIsRecording(false);
      await cameraRef.current.stopRecording(); // Stop recording
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: tabBarHeight }]}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <TouchableOpacity
          style={styles.fullScreenTouchable}
          activeOpacity={1}
          onPress={handleDoubleTap}
        >
          {/* The camera tap area */}
        </TouchableOpacity>
      </CameraView>

      {/* Progress Bar for countdown */}
      {isRecording && (
        <Text style={styles.countdownText}>{countdown}</Text>
      )}

      {/* Circle button for photo and video */}
      <View style={[styles.buttonContainer, { paddingBottom: tabBarHeight }]}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={takePhoto} // Take photo on single tap
          onLongPress={handlePressIn} // Start recording on long press
          onPressOut={handlePressOut} // Stop recording when long press is released
          activeOpacity={0.6}
        >
          <View style={styles.captureButtonOutline}>
            <View style={styles.captureButtonInner} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 70,
    left: '50%',
    transform: [{ translateX: -35 }],
  },
  captureButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonOutline: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    opacity: 0.1
  },
  fullScreenTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    position: 'absolute',
    alignSelf: 'center',
    top: 80, // only necessary for my example image
    color:'white',
    fontWeight:'bold',
    fontSize: 20,
  }
});
