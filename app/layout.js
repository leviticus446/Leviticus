import './globals.css';

export const metadata = {
  title: 'Leviticus 11 | We Serve You Clean Food',
  description: 'Restoran & cafe di Jakarta Barat — clean food, suasana botanical yang nyaman dan elegan.',
  metadataBase: new URL('https://leviticus11.vercel.app'),
  openGraph: {
    title: 'Leviticus 11',
    description: 'We serve you clean food — Jakarta Barat',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="font-body">{children}</body>
    </html>
  );
}
