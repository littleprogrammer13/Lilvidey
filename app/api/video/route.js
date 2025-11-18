import { NextResponse } from "next/server";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { fetchFrame } from "../../../utils/fetchFrame";
import { interpolateFrames } from "../../../utils/interpolateFrames";

export async function POST(req) {
  const { prompt } = await req.json();
  const fps = 24;
  const seconds = 10;
  const keyFrames = 12;

  // 1️⃣ Gerar frames reais
  const frames = [];
  for (let i = 0; i < keyFrames; i++) {
    frames.push(await fetchFrame(prompt));
  }

  // 2️⃣ Interpolação para 24–30 FPS
  const totalFrames = fps * seconds;
  const allFrames = interpolateFrames(frames, totalFrames);

  // 3️⃣ Montar vídeo
  const ffmpeg = createFFmpeg({ log: false });
  await ffmpeg.load();

  allFrames.forEach((frame, i) => {
    ffmpeg.FS("writeFile", `frame${i}.png`, await fetchFile(frame));
  });

  await ffmpeg.run(
    "-r",
    `${fps}`,
    "-i",
    "frame%d.png",
    "-vcodec",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "output.mp4"
  );

  const data = ffmpeg.FS("readFile", "output.mp4");

  return new NextResponse(data, {
    headers: { "Content-Type": "video/mp4" }
  });
}
