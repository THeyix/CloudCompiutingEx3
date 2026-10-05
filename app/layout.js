import './globals.css';
import Link from 'next/link';

export const metadata = { title: 'Product Catalog' };

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="header-inner">
            <Link href="/" className="logo">📦 Product Catalog</Link>
            <span className="muted">Next.js · Postgres · Blob</span>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
