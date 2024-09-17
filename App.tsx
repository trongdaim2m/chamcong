import React, {useEffect, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  CameraPermissionStatus,
} from 'react-native-vision-camera';
import detectFaces from '@react-native-ml-kit/face-detection';

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    const checkAndRequestCameraPermission = async () => {
      const cameraPermission: CameraPermissionStatus =
        await Camera.getCameraPermissionStatus();

      if (cameraPermission === 'granted') {
        return;
      } else if (
        cameraPermission === 'denied' ||
        cameraPermission === 'restricted'
      ) {
        Alert.alert(
          'Quyền truy cập Camera bị từ chối',
          'Vui lòng cấp quyền truy cập Camera trong cài đặt của thiết bị để tiếp tục.',
          [
            {
              text: 'Hủy bỏ',
              style: 'cancel',
            },
            {
              text: 'Mở cài đặt',
              onPress: () => {
                Linking.openSettings();
              },
            },
          ],
        );
      } else if (cameraPermission === 'not-determined') {
        const newCameraPermission: CameraPermissionStatus =
          await Camera.requestCameraPermission();
        if (newCameraPermission !== 'granted') {
          Alert.alert(
            'Quyền truy cập Camera bị từ chối',
            'Bạn đã từ chối quyền truy cập Camera, ứng dụng sẽ không thể sử dụng Camera.',
          );
        }
      }
    };

    checkAndRequestCameraPermission();
  }, []);

  const handleCapturePhoto = async () => {
    if (cameraRef.current && device) {
      try {
        const photo = await cameraRef.current.takePhoto({});

        const faces = await detectFaces.detect(photo.path);
        if (faces.length > 0) {
          Alert.alert(
            'Khuôn mặt được nhận diện',
            `Đã phát hiện ${faces.length} khuôn mặt.`,
          );
        } else {
          Alert.alert('Không phát hiện được khuôn mặt');
        }
      } catch (error) {
        console.error('Lỗi khi chụp ảnh: ', error);
        Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
      }
    }
  };

  if (device == null) {
    return <Text>No camera available</Text>;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? 'white' : 'black',
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? 'light' : 'dark',
          },
        ]}>
        {children}
      </Text>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        ref={cameraRef}
      />
      <TouchableOpacity
        style={styles.captureButton}
        onPress={handleCapturePhoto}>
        <Text style={styles.buttonText}>Quét khuôn mặt</Text>
      </TouchableOpacity>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'darker' : 'lighter',
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <Section title="Face Detection"> </Section>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  captureButton: {
    position: 'absolute',
    bottom: 50,
    width: 150,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
