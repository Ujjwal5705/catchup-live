import './globals.css';

export const metadata = {
  title: 'CatchUp — never feel lost in a live match again',
  description: 'AI live-match companion: one-tap recaps, ask anything, live fantasy points'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
