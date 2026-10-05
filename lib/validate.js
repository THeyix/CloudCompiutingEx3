// Validates 4 data types: string, number, boolean, date (+ file in the route)
export function validate(fd) {
  const errors = {};
  const name = String(fd.get('name') ?? '').trim();
  if (name.length < 2 || name.length > 100) errors.name = 'String, 2-100 characters';

  const priceRaw = fd.get('price');
  const price = Number(priceRaw);
  if (priceRaw === null || priceRaw === '' || !Number.isFinite(price) || price < 0)
    errors.price = 'Number, >= 0';

  const stock = fd.get('inStock');
  if (stock !== 'true' && stock !== 'false') errors.inStock = 'Boolean (true/false)';

  const date = String(fd.get('releaseDate') ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date)))
    errors.releaseDate = 'Date, format YYYY-MM-DD';

  const image = fd.get('image');
  if (image && image.size > 0) {
    if (!image.type.startsWith('image/')) errors.image = 'File must be an image';
    else if (image.size > 4 * 1024 * 1024) errors.image = 'Max 4 MB';
  }
  return { errors, ok: Object.keys(errors).length === 0,
           data: { name, price, inStock: stock === 'true', releaseDate: date, image } };
}
