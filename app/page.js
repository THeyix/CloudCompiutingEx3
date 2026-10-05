'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const dateOnly = (d) => (d ? String(d).slice(0, 10) : '');

export default function Home() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');

  async function load() {
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (!res.ok || !Array.isArray(json)) throw new Error(json.error || 'Failed to load');
      setItems(json);
    } catch (e) {
      setMsg(e.message);
    }
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const res = await fetch(
        editing ? `/api/products/${editing.id}` : '/api/products',
        { method: editing ? 'PUT' : 'POST', body: new FormData(form) }
      );
      const json = await res.json().catch(() => ({ error: 'Server error ' + res.status }));
      if (!res.ok) {
        setErrors(json.errors || {});
        setMsg(json.error || '');
        return;
      }
      setErrors({});
      setMsg('');
      setEditing(null);
      form.reset();
      load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      setMsg(res.ok ? '' : json.error || 'Delete failed');
    } catch (err) {
      setMsg(err.message);
    }
    load();
  }

  function startEdit(p) {
    setEditing(p);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const f = editing || {};

  return (
    <>
      <h1>Products</h1>
      <p className="subtitle">Create, view, edit and delete products.</p>

      {msg && <div className="alert">⚠ {msg}</div>}

      <div className="card">
        <h2>{editing ? `Edit: ${editing.name}` : 'Add new product'}</h2>
        <form key={editing?.id ?? 'new'} onSubmit={submit}>
          <div className="grid2">
            <label>
              Name (text)
              <input name="name" placeholder="e.g. Coffee mug" defaultValue={f.name} />
            </label>
            <label>
              Price (number)
              <input name="price" placeholder="e.g. 9.99" defaultValue={f.price} />
            </label>
          </div>
          <div className="grid2">
            <label>
              Availability (boolean)
              <select name="inStock" defaultValue={String(f.in_stock ?? true)}>
                <option value="true">In stock</option>
                <option value="false">Out of stock</option>
              </select>
            </label>
            <label>
              Release date (date)
              <input name="releaseDate" type="date" defaultValue={dateOnly(f.release_date)} />
            </label>
          </div>
          <label>
            Image (file){editing && ' – leave empty to keep current'}
            <input name="image" type="file" accept="image/*" />
          </label>
          {Object.entries(errors).map(([k, v]) => (
            <span key={k} className="error">• {k}: {v}</span>
          ))}
          <div className="actions">
            <button type="submit">{editing ? 'Update product' : 'Create product'}</button>
            {editing && (
              <button type="button" className="secondary" onClick={() => setEditing(null)}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="list-head">
        <h2 style={{ margin: 0 }}>All products</h2>
        <span className="count">{items.length} total</span>
      </div>

      {items.length === 0 && <div className="empty">No products yet. Add your first one above.</div>}

      <div className="products">
        {items.map((p) => (
          <div key={p.id} className="card product">
            {p.image_url
              ? <img className="thumb" src={p.image_url} alt={p.name} />
              : <div className="thumb ph">No image</div>}
            <div className="product-body">
              <h3>{p.name}</h3>
              <div className="price">${p.price}</div>
              <div className="badges">
                <span className={p.in_stock ? 'badge ok' : 'badge out'}>
                  {p.in_stock ? 'In stock' : 'Out of stock'}
                </span>
                <span className={p.released ? 'badge ok' : 'badge'}>
                  {p.released ? 'Released' : 'Upcoming'}
                </span>
              </div>
              <span className="muted">Release: {dateOnly(p.release_date)}</span>
            </div>
            <div className="product-actions">
              <Link href={`/products/${p.id}`} className="btn">View</Link>
              <button type="button" className="secondary" onClick={() => startEdit(p)}>Edit</button>
              <button type="button" className="danger" onClick={() => remove(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
