"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const generateVideo = async () => {
    const res = await fetch("/api/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (data.videoUrl) setVideoUrl(data.videoUrl);
    else alert(data.error || "Erro ao gerar vídeo");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Videy</h1>
      <input
        type="text"
        placeholder="Digite o prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: "300px", padding: "0.5rem", marginRight: "1rem" }}
      />
      <button onClick={generateVideo}>Gerar Vídeo</button>

      {videoUrl && (
        <div style={{ marginTop: "2rem" }}>
          <video src={videoUrl} controls width={480} />
        </div>
      )}
    </div>
  );
}
