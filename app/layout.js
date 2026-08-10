import "./globals.css";

export const metadata = {
  title: "Electric Pulse",
  description: "Experience the Pulse of Future Events",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
