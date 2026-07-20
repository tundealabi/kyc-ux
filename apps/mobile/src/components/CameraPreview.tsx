import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Button } from "./Button";

type Props = {
  onCapture: (uri: string) => void;
  busy?: boolean;
};

export function CameraPreview({ onCapture, busy }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

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
