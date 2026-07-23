import "./globals.css";

export const metadata = {
  title: "Destiny Church",
  description: "Announcements and sermon notes for all Destiny Church campuses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen">{children}</body>
    </html>
  );
}
