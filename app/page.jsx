"use client";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  async function gerar() {
    setLoading(true);
    const res = await fetch("/api/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
    setLoading(false);
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Videy, made by Vilor</h1>

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Digite seu prompt..."
        style={{ width: "300px", padding: "0.5rem" }}
      />
      <button onClick={gerar} style={{ marginLeft: 10 }}>
        {loading ? "Gerando..." : "Gerar Vídeo"}
      </button>

      {videoUrl && (
        <div style={{ marginTop: "2rem" }}>
          <video src={videoUrl} controls width={720} />
        </div>
      )}
    </main>
  );
}
