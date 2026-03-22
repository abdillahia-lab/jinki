import { getCollection } from 'astro:content';

export async function GET() {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  const items = posts.map(post => `
    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>https://jinki.ai/blog/${post.id}</link>
      <description>${escapeXml(post.data.description)}</description>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <guid>https://jinki.ai/blog/${post.id}</guid>
      <author>${escapeXml(post.data.author || 'Adnan Abdillahi')}</author>
    </item>`).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Jinki Aerial Intelligence — Blog</title>
    <link>https://jinki.ai/blog</link>
    <description>Insights on aerial intelligence, autonomous systems, and infrastructure monitoring from the Jinki team.</description>
    <language>en-us</language>
    <lastBuildDate>${posts[0]?.data.date.toUTCString()}</lastBuildDate>
    <atom:link href="https://jinki.ai/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss.trim(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
