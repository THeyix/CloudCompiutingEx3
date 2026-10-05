'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});

  const load = async () => setItems(await (await fetch('/api/products')).json());
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    const form = e.target;
    const res = await fetch(
      editing ? `/api/products/${editing.id}` : '/api/products',
      { method: editing ? 'PUT' : 'POST', body: new FormData(form) }
    );
    const json = await res.json();
    if (!res.ok) return setErrors(json.errors || { form: json.error });
    setErrors({});
    setEditing(null);
    form.reset();
    load();
  }

  async function remove(id) {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
  }

  const f = editing || {};

  return (
    <>
      <h1>Products</h1>

      <div className="card">
        <form key={editing?.id ?? 'new'} onSubmit={submit}>
          <input name="name" placeholder="Name (text)" defaultValue={f.name} />
          <input name="price" placeholder="Price (number)" defaultValue={f.price} />
          <select name="inStock" defaultValue={String(f.in_stock ?? true)}>
            <option value="true">In stock</option>
            <option value="false">Out of stock</option>
          </select>
          <input name="releaseDate" type="date" defaultValue={f.release_date?.slice(0, 10)} />
          <input name="image" type="file" accept="image/*" />
          {Object.entries(errors).map(([k, v]) => (
            <span key={k} className="error">{k}: {v}</span>
          ))}
          <div className="actions">
            <button>{editing ? 'Update' : 'Create'}</button>
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
              {p.in_stock ? 'In stock' : 'Out of stock'} · release {p.release_date.slice(0, 10)}
            </div>
            <span className={p.released ? 'badge ok' : 'badge'}>
              {p.released ? 'Released' : 'Upcoming'}
            </span>
          </div>
          <div className="actions">
            <button className="secondary" onClick={() => setEditing(p)}>Edit</button>
            <button className="danger" onClick={() => remove(p.id)}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );
}
