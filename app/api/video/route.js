import { NextResponse } from "next/server";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { fetchFrame } from "../../../utils/fetchFrame";

export async function POST(req) {
  const { prompt } = await req.json();

  const fps = 24;
  const seconds = 10;
  const keyFrames = 12; // 12 frames reais
  const totalFrames = fps * seconds;

  // 1. Gerar frames reais (API pública)
  const frames = [];
  for (let i = 0; i < keyFrames; i++) {
    const frame = await fetchFrame(prompt);
    frames.push(frame);
  }

  // 2. Interpolação simples: distribuir frames
  const interpolated = [];
  const repeat = Math.floor(totalFrames / keyFrames);

  frames.forEach((f) => {
    for (let i = 0; i < repeat; i++) interpolated.push(f);
  });

  // 3. Montar o vídeo
  const ffmpeg = createFFmpeg({ log: false });
  await ffmpeg.load();

  let i = 0;
  for (const frame of interpolated) {
    ffmpeg.FS("writeFile", `frame${i}.png`, await fetchFile(frame));
    i++;
  }

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
    headers: {
      "Content-Type": "video/mp4"
    }
  });
}
