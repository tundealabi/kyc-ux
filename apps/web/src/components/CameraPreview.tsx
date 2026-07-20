import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type CameraPermission = "pending" | "granted" | "denied" | "unavailable";

export type CameraPreviewHandle = {
  captureFrame: () => string;
};

type Props = {
  onPermissionChange?: (permission: CameraPermission) => void;
};

export const CameraPreview = forwardRef<CameraPreviewHandle, Props>(
  function CameraPreview({ onPermissionChange }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [permission, setPermission] = useState<CameraPermission>("pending");
    const [stream, setStream] = useState<MediaStream | null>(null);

    useImperativeHandle(ref, () => ({
      captureFrame() {
        const video = videoRef.current;
        if (!video || !video.videoWidth) return "stub-frame";
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.8);
      },
    }));

    useEffect(() => {
      onPermissionChange?.(permission);
    }, [permission, onPermissionChange]);

    useEffect(() => {
      let cancelled = false;

      (async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
          setPermission("unavailable");
          return;
        }

        try {
          const media = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });
          if (cancelled) {
            media.getTracks().forEach((t) => t.stop());
            return;
          }
          setStream(media);
          setPermission("granted");
        } catch {
          if (!cancelled) setPermission("denied");
        }
      })();

      return () => {
        cancelled = true;
      };
    }, []);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !stream) return;

      video.srcObject = stream;
      void video.play().catch(() => {});

      return () => {
        video.srcObject = null;
      };
    }, [stream]);

    useEffect(() => {
      return () => {
        stream?.getTracks().forEach((t) => t.stop());
      };
    }, [stream]);

    if (permission === "pending") {
      return (
        <p className="m-0 rounded-xl bg-[#f5f5f5] p-4 text-muted">
          Requesting camera access…
        </p>
      );
    }

    if (permission === "denied") {
      return (
        <div className="rounded-xl bg-danger-soft p-4 text-danger" role="alert">
          <p className="m-0">
            Camera permission was denied. Allow camera access in your browser
            settings, then refresh this page.
          </p>
        </div>
      );
    }

    if (permission === "unavailable") {
      return (
        <div className="rounded-xl bg-danger-soft p-4 text-danger" role="alert">
          <p className="m-0">
            This browser has no camera available for face verification.
          </p>
        </div>
      );
    }

    return (
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#111]">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="h-full w-full scale-x-[-1] object-cover"
        />
      </div>
    );
  },
);
