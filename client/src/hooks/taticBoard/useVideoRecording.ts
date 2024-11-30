import { useState, useRef, useCallback } from "react";

interface VideoRecordingState {
  mediaRecorder: MediaRecorder | null;
  chunks: Blob[];
  isRecording: boolean;
  recordingStartTime: number | null;
  expectedDuration: number | null;
}

const useVideoRecording = () => {
  const [recordingState, setRecordingState] = useState<VideoRecordingState>({
    mediaRecorder: null,
    chunks: [],
    isRecording: false,
    recordingStartTime: null,
    expectedDuration: null,
  });

  const videoChunksRef = useRef<Blob[]>([]);

  const getSupportedMimeType = (): string => {
    const types = ["video/webm", "video/mp4"];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "video/webm";
  };

  const downloadVideo = useCallback(
    (fileName: string = "tacticboard.mp4") => {
      if (videoChunksRef.current.length === 0) return;

      const mimeType = recordingState.mediaRecorder?.mimeType || "video/webm";

      // Create blob with duration metadata
      const videoBlob = new Blob(videoChunksRef.current, {
        type: mimeType,
      });

      // Create a temporary video element to set the duration
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";

      const url = URL.createObjectURL(videoBlob);
      videoElement.src = url;

      videoElement.onloadedmetadata = () => {
        URL.revokeObjectURL(url);

        // Create the final blob with correct duration
        const finalBlob = new Blob(videoChunksRef.current, {
          type: mimeType,
        });

        const finalUrl = URL.createObjectURL(finalBlob);
        const a = document.createElement("a");
        a.href = finalUrl;
        const extension = mimeType.includes("webm") ? ".webm" : ".mp4";
        a.download = fileName.replace(/\.[^/.]+$/, "") + extension;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(finalUrl);
        }, 100);
      };
    },
    [recordingState.mediaRecorder],
  );

  const startRecording = useCallback(
    (
      canvas: HTMLCanvasElement,
      totalPages: number,
      intervalDuration: number,
    ) => {
      try {
        videoChunksRef.current = [];

        const stream = canvas.captureStream(60);
        const mimeType = getSupportedMimeType();
        console.log("Using MIME type:", mimeType);

        const expectedDuration = totalPages * intervalDuration;

        const options: MediaRecorderOptions = {
          mimeType,
          videoBitsPerSecond: 8000000,
        };

        const recorder = new MediaRecorder(stream, options);

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            videoChunksRef.current.push(event.data);
          }
        };

        recorder.onerror = (event) => {
          console.error("MediaRecorder error:", event);
          setRecordingState((prev) => ({
            ...prev,
            isRecording: false,
            recordingStartTime: null,
            expectedDuration: null,
          }));
        };

        recorder.onstop = () => {
          // Ensure we've captured the full duration
          if (recordingState.expectedDuration) {
            const actualDuration =
              Date.now() - (recordingState.recordingStartTime || 0);
            if (actualDuration < recordingState.expectedDuration) {
              console.warn(
                `Recording stopped early. Expected: ${recordingState.expectedDuration}ms, Actual: ${actualDuration}ms`,
              );
            }
          }

          setRecordingState((prev) => ({
            ...prev,
            isRecording: false,
            recordingStartTime: null,
            expectedDuration: null,
          }));
        };

        // Collect data more frequently for smoother recording
        recorder.start(200); // Collect every 200ms

        setRecordingState({
          mediaRecorder: recorder,
          chunks: [],
          isRecording: true,
          recordingStartTime: Date.now(),
          expectedDuration: expectedDuration,
        });
      } catch (error) {
        console.error("Error starting recording:", error);
        setRecordingState((prev) => ({
          ...prev,
          isRecording: false,
          recordingStartTime: null,
          expectedDuration: null,
        }));
      }
    },
    [],
  );

  const stopRecording = useCallback(() => {
    const recorder = recordingState.mediaRecorder;
    if (recorder) {
      try {
        if (recorder.state === "recording") {
          // Wait for any remaining data
          const remainingTime =
            (recordingState.expectedDuration || 0) -
            (Date.now() - (recordingState.recordingStartTime || 0));

          if (remainingTime > 0) {
            setTimeout(() => {
              recorder.requestData();
              recorder.stop();
            }, remainingTime);
          } else {
            recorder.requestData();
            recorder.stop();
          }
        } else if (recorder.state === "paused") {
          recorder.resume();
          recorder.requestData();
          recorder.stop();
        }
      } catch (error) {
        console.error("Error stopping recording:", error);
        setRecordingState((prev) => ({
          ...prev,
          isRecording: false,
          recordingStartTime: null,
          expectedDuration: null,
        }));
      }
    }
  }, [
    recordingState.mediaRecorder,
    recordingState.expectedDuration,
    recordingState.recordingStartTime,
  ]);

  return {
    isRecording: recordingState.isRecording,
    startRecording,
    stopRecording,
    downloadVideo,
  };
};

export default useVideoRecording;
