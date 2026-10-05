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
    const res = await fetch(editing ? `/api/products/${editing.id}` : '/api/products',
      { method: editing ? 'PUT' : 'POST', body: new FormData(form) });
    const json = await res.json();
    if (!res.ok) return setErrors(json.errors || { form: json.error });
    setErrors({}); setEditing(null); form.reset(); load();
  }
  async function remove(id) { await fetch(`/api/products/${id}`, { method: 'DELETE' }); load(); }

  const f = editing || {};
  return (<>
    <h1>Products</h1>
    <form key={editing?.id ?? 'new'} onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
      <input name="name" placeholder="Name (text)" defaultValue={f.name} />
      <input name="price" placeholder="Price (number)" defaultValue={f.price} />
      <select name="inStock" defaultValue={String(f.in_stock ?? true)}>
        <option value="true">In stock</option><option value="false">Out of stock</option>
      </select>
      <input name="releaseDate" type="date" defaultValue={f.release_date?.slice(0, 10)} />
      <input name="image" type="file" accept="image/*" />
      {Object.entries(errors).map(([k, v]) => <small key={k} style={{ color: 'crimson' }}>{k}: {v}</small>)}
      <div><button>{editing ? 'Update' : 'Create'}</button>
        {editing && <button type="button" onClick={() => setEditing(null)}>Cancel</button>}</div>
    </form>
    <hr />
    {items.map(p => (
      <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8, borderBottom: '1px solid #ddd' }}>
        {p.image_url && <img src={p.image_url} width={56} height={56} style={{ objectFit: 'cover' }} />}
        <div style={{ flex: 1 }}>
          <b>{p.name}</b> — ${p.price} — {p.in_stock ? 'in stock' : 'out'}<br />
          <small>release {p.release_date.slice(0, 10)} · {p.released ? 'released ✅' : 'upcoming'}</small>
        </div>
        <button onClick={() => setEditing(p)}>Edit</button>
        <button onClick={() => remove(p.id)}>Delete</button>
      </div>))}
  </>);
}
