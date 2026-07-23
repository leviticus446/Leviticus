import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Leviticus 11 | We Serve You Clean Food',
  description: 'Restoran & cafe di Jakarta Barat — clean food, suasana botanical yang nyaman dan elegan.',
  metadataBase: new URL('https://leviticus.vercel.app'),
  manifest: '/manifest.json',
  icons: {
    icon: '/images/IMG_20260717_114347.png',
    apple: '/images/IMG_20260717_114347.png',
  },
  openGraph: {
    title: 'Leviticus 11',
    description: 'We serve you clean food — Jakarta Barat',
    type: 'website',
    locale: 'id_ID',
    images: ['/images/IMG_20260717_114347.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#262420" />
      </head>
      <body className="font-body bg-ivory text-forest">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
