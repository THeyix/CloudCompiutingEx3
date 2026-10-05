import './globals.css';

export const metadata = { title: 'Products CRUD' };

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="wrap">{children}</div>
      </body>
    </html>
  );
}
