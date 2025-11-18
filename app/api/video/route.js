import { NextResponse } from "next/server";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { fetchFrame } from "../../../utils/fetchFrame";
import { interpolateFrames } from "../../../utils/interpolateFrames";

// Endpoint POST /api/video
export async function POST(req) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt é obrigatório" }, { status: 400 });
    }

    const fps = 24;      // Frames por segundo
    const seconds = 10;  // Duração máxima do vídeo
    const keyFrames = 12; // Quantidade de frames “chave” gerados

    // 1️⃣ Gerar frames reais do prompt
    const frames = [];
    for (let i = 0; i < keyFrames; i++) {
      const frameBuffer = await fetchFrame(prompt);
      frames.push(frameBuffer);
    }

    // 2️⃣ Interpolação para atingir FPS total
    const totalFrames = fps * seconds;
    const allFrames = interpolateFrames(frames, totalFrames);

    // 3️⃣ Inicializar ffmpeg.wasm
    const ffmpeg = createFFmpeg({ log: false });
    await ffmpeg.load();

    // 4️⃣ Escrever todos os frames no filesystem virtual
    let i = 0;
    for (const frame of allFrames) {
      ffmpeg.FS("writeFile", `frame${i}.png`, await fetchFile(frame));
      i++;
    }

    // 5️⃣ Criar vídeo MP4 com libx264
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

    // 6️⃣ Ler arquivo final
    const data = ffmpeg.FS("readFile", "output.mp4");

    // 7️⃣ Retornar vídeo como resposta
    return new NextResponse(data, {
      headers: { "Content-Type": "video/mp4" },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
