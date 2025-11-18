export const metadata = {
  title: "Video AI Studio",
  description: "Gere vídeos curtos com AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "sans-serif" }}>{children}</body>
    </html>
  );
}
