import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Device from "expo-device";
import { Button } from "./Button";

type Props = {
  onCapture: (uri: string) => void;
  busy?: boolean;
};

const SIMULATOR_PHOTO_URI =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=480&fit=crop";

export function CameraPreview({ onCapture, busy }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const isSimulator = !Device.isDevice;

  useEffect(() => {
    if (isSimulator) {
      setReady(true);
      return;
    }
    if (permission && !permission.granted && permission.canAskAgain) {
      void requestPermission();
    }
  }, [isSimulator, permission, requestPermission]);

  if (isSimulator) {
    return (
      <View className="gap-3">
        <View className="aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-[#1a1a1a] px-6">
          <View className="mb-4 h-28 w-28 rounded-full border-2 border-dashed border-white/40" />
          <Text className="text-center text-sm font-semibold text-white">
            Camera unavailable in simulator
          </Text>
          <Text className="mt-1.5 text-center text-xs leading-5 text-white/70">
            iOS Simulator has no camera hardware. Use a physical device for a
            live preview, or simulate capture below.
          </Text>
        </View>
        <Button
          label={busy ? "Verifying…" : "Simulate capture and verify"}
          disabled={!ready || busy}
          onPress={() => onCapture(SIMULATOR_PHOTO_URI)}
        />
      </View>
    );
  }

  if (!permission) {
    return (
      <Text className="rounded-xl bg-[#f5f5f5] p-4 text-muted">
        Checking camera permission…
      </Text>
    );
  }

  if (!permission.granted) {
    return (
      <View className="gap-3 rounded-xl bg-danger-soft p-4">
        <Text className="text-sm text-danger">
          Camera permission was denied. Enable it in Settings to continue face
          verification.
        </Text>
        {permission.canAskAgain ? (
          <Button
            label="Allow camera"
            onPress={() => void requestPermission()}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View className="gap-3">
      <View className="aspect-[4/3] overflow-hidden rounded-2xl bg-black">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="front"
          onCameraReady={() => setReady(true)}
        />
      </View>
      <Button
        label={busy ? "Verifying…" : "Capture and verify"}
        disabled={!ready || busy}
        onPress={async () => {
          const photo = await cameraRef.current?.takePictureAsync({
            quality: 0.7,
            base64: false,
          });
          if (photo?.uri) onCapture(photo.uri);
        }}
      />
    </View>
  );
}
