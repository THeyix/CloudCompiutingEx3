'use client';
import { useEffect, useState } from 'react';

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
      setMsg('');
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
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) setMsg(json.error || 'Delete failed');
      else setMsg('');
    } catch (err) {
      setMsg(err.message);
    }
    load();
  }

  const f = editing || {};

  return (
    <>
      <h1>Products</h1>

      {msg && <div className="card error">⚠ {msg}</div>}

      <div className="card">
        <form key={editing?.id ?? 'new'} onSubmit={submit}>
          <input name="name" placeholder="Name (text)" defaultValue={f.name} />
          <input name="price" placeholder="Price (number)" defaultValue={f.price} />
          <select name="inStock" defaultValue={String(f.in_stock ?? true)}>
            <option value="true">In stock</option>
            <option value="false">Out of stock</option>
          </select>
          <input name="releaseDate" type="date" defaultValue={dateOnly(f.release_date)} />
          <input name="image" type="file" accept="image/*" />
          {Object.entries(errors).map(([k, v]) => (
            <span key={k} className="error">{k}: {v}</span>
          ))}
          <div className="actions">
            <button type="submit">{editing ? 'Update' : 'Create'}</button>
            {editing && (
              <button type="button" className="secondary" onClick={() => setEditing(null)}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {items.map((p) => (
        <div key={p.id} className="card item">
          {p.image_url ? <img src={p.image_url} alt={p.name} /> : <div className="ph" />}
          <div className="info">
            <b>{p.name}</b> · ${p.price}
            <div className="muted">
              {p.in_stock ? 'In stock' : 'Out of stock'} · release {dateOnly(p.release_date)}
            </div>
            <span className={p.released ? 'badge ok' : 'badge'}>
              {p.released ? 'Released' : 'Upcoming'}
            </span>
          </div>
          <div className="actions">
            <button type="button" className="secondary" onClick={() => setEditing(p)}>Edit</button>
            <button type="button" className="danger" onClick={() => remove(p.id)}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );
}
