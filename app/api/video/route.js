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

    const fps = 30;      // Frames por segundo
    const seconds = 10;  // Duração máxima do vídeo
    const keyFrames = 12; // Frames-chave iniciais

    // 1️⃣ Gerar frames reais a partir do prompt
    const frames = [];
    for (let i = 0; i < keyFrames; i++) {
      const frameBuffer = await fetchFrame(prompt);
      frames.push(frameBuffer);
    }

    // 2️⃣ Interpolar frames para atingir fps * duração
    const totalFrames = fps * seconds;
    const allFrames = interpolateFrames(frames, totalFrames);

    // 3️⃣ Inicializar ffmpeg.wasm
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    // 4️⃣ Salvar todos os frames no filesystem virtual
    let i = 0;
    for (const frame of allFrames) {
      ffmpeg.FS("writeFile", `frame${i}.png`, await fetchFile(frame));
      i++;
    }

    // 5️⃣ Criar vídeo MP4
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

    // 6️⃣ Ler arquivo final
    const data = ffmpeg.FS("readFile", "output.mp4");

    // 7️⃣ Converter para Uint8Array e base64 para o frontend
    const videoBlob = new Blob([data.buffer], { type: "video/mp4" });
    const videoUrl = URL.createObjectURL(videoBlob);

    // Retornar URL do vídeo para o frontend
    return NextResponse.json({ videoUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
