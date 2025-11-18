"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [loading, setLoading] = useState(false);

  const generateVideo = async () => {
    if (!prompt.trim()) return alert("Digite um prompt!");

    setLoading(true);
    setVideoSrc("");

    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (data.videoBase64) {
        setVideoSrc(`data:video/mp4;base64,${data.videoBase64}`);
      } else {
        alert(data.error || "Erro ao gerar vídeo");
      }
    } catch (err) {
      alert("Erro no servidor: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Video AI Studio</h1>
      <input
        type="text"
        placeholder="Digite o prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: "300px", padding: "0.5rem", marginRight: "1rem" }}
      />
      <button onClick={generateVideo} disabled={loading}>
        {loading ? "Gerando..." : "Gerar Vídeo"}
      </button>

      {videoSrc && (
        <div style={{ marginTop: "2rem" }}>
          <video src={videoSrc} controls width={480} />
        </div>
      )}
    </div>
  );
}
