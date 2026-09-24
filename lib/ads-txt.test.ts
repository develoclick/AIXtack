/**
 * /ads.txt: responde 200, texto plano y una sola línea con el formato oficial de Google. El ID de editor (pub-1950156439970490)
 * es del dueño del sitio y no debe cambiarse.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { GET } from "../app/ads.txt/route";

test("/ads.txt: 200, text/plain y «google.com, pub-…, DIRECT, f08c47fec0942fa0» con el ID del dueño", async () => {
  const antes = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  try {
    const r = await GET();
    assert.equal(r.status, 200);
    assert.match(r.headers.get("content-type") ?? "", /^text\/plain/);
    assert.equal(await r.text(), "google.com, pub-1950156439970490, DIRECT, f08c47fec0942fa0");
  } finally {
    if (antes !== undefined) process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = antes;
  }
});

test("/ads.txt con la variable de entorno en formato ca-pub-… produce la misma línea", async () => {
  const antes = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = "ca-pub-1950156439970490";
  try {
    assert.equal(await (await GET()).text(), "google.com, pub-1950156439970490, DIRECT, f08c47fec0942fa0");
  } finally {
    if (antes === undefined) delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
    else process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = antes;
  }
});
