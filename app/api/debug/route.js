export async function GET() {
  const names = Object.keys(process.env).filter(
    (k) => k.includes('BLOB') || k.includes('TOKEN') || k.includes('DATABASE')
  );
  return Response.json({
    hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    matchingVariableNames: names,
  });
}
