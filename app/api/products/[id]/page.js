'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const dateOnly = (d) => (d ? String(d).slice(0, 10) : '');

export default function ProductPage() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load');
        setP(json);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  return (
    <>
      <Link href="/" className="btn secondary">← Back to list</Link>

      {error && <div className="alert" style={{ marginTop: 16 }}>⚠ {error}</div>}
      {!p && !error && <p className="muted" style={{ marginTop: 16 }}>Loading…</p>}

      {p && (
        <div className="card detail">
          {p.image_url
            ? <img className="detail-img" src={p.image_url} alt={p.name} />
            : <div className="detail-img ph">No image</div>}

          <div className="detail-info">
            <h1>{p.name}</h1>
            <div className="price big">${p.price}</div>
            <div className="badges">
              <span className={p.in_stock ? 'badge ok' : 'badge out'}>
                {p.in_stock ? 'In stock' : 'Out of stock'}
              </span>
              <span className={p.released ? 'badge ok' : 'badge'}>
                {p.released ? 'Released' : 'Upcoming'}
              </span>
            </div>
            <div className="rows">
              <div className="row"><span>ID</span><span>{p.id}</span></div>
              <div className="row"><span>Release date</span><span>{dateOnly(p.release_date)}</span></div>
              <div className="row"><span>Availability</span><span>{p.in_stock ? 'Yes' : 'No'}</span></div>
              <div className="row"><span>Created</span><span>{dateOnly(p.created_at)}</span></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
