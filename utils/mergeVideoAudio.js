import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export async function mergeVideoAudio(videoBuffer, audioBuffer) {
  const ffmpeg = createFFmpeg({ log: false });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", "video.mp4", await fetchFile(videoBuffer));
  ffmpeg.FS("writeFile", "audio.mp3", await fetchFile(audioBuffer));

  await ffmpeg.run(
    "-i",
    "video.mp4",
    "-i",
    "audio.mp3",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-shortest",
    "output.mp4"
  );

  return ffmpeg.FS("readFile", "output.mp4");
}
