const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export async function GET() {
  const publisherId = adsenseClientId?.replace("ca-pub-", "") ?? "";
  const body = publisherId
    ? `google.com, pub-${publisherId}, DIRECT, f08c47fec0942fa0`
    : "# Configura NEXT_PUBLIC_ADSENSE_CLIENT_ID para generar ads.txt";

  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
