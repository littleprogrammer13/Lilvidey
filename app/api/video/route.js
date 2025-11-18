import { NextResponse } from "next/server";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { fetchFrame } from "../../../utils/fetchFrame";
import { interpolateFrames } from "../../../utils/interpolateFrames";

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt é obrigatório" }, { status: 400 });
    }

    const fps = 30;
    const seconds = 10;
    const keyFrames = 12;

    // Gerar frames iniciais
    const frames = [];
    for (let i = 0; i < keyFrames; i++) {
      frames.push(await fetchFrame(prompt));
    }

    // Interpolação para FPS total
    const allFrames = interpolateFrames(frames, fps * seconds);

    // Inicializar ffmpeg
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    // Salvar frames
    for (let i = 0; i < allFrames.length; i++) {
      ffmpeg.FS("writeFile", `frame${i}.png`, await fetchFile(allFrames[i]));
    }

    // Criar vídeo
    await ffmpeg.run(
      "-framerate",
      `${fps}`,
      "-i",
      "frame%d.png",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "output.mp4"
    );

    const data = ffmpeg.FS("readFile", "output.mp4");
    const videoBase64 = Buffer.from(data).toString("base64");

    return NextResponse.json({ videoBase64 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
