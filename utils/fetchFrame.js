export async function fetchFrame(prompt) {
  const url = `https://hf.space/embed/akhaliq/ai-image-generation-demo/+/api/predict/?prompt=${encodeURIComponent(
    prompt
  )}`;

  const res = await fetch(url);
  const data = await res.json();

  // API retorna base64 sem header
  const base64 = data.data[0];

  return Buffer.from(base64, "base64");
}
