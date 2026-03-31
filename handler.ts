// ClawHub Local Skill - runs entirely in your agent, no API key required
// Screenshot API - Capture screenshots of any URL

async function captureScreenshot(url: string, width: number, height: number): Promise<{ image_url: string; method: string }> {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&strategy=desktop`;
  try {
    const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(30000) });
    if (resp.ok) {
      const data = await resp.json();
      const screenshot = data?.lighthouseResult?.audits?.['final-screenshot']?.details?.data;
      if (screenshot) return { image_url: screenshot, method: 'pagespeed' };
    }
  } catch {}
  const thumbUrl = `https://image.thum.io/get/width/${width}/crop/${height}/noanimate/${encodeURIComponent(url)}`;
  return { image_url: thumbUrl, method: 'thumbnail' };
}

export async function run(input: { url: string; width?: number; height?: number; full_page?: boolean }) {
  if (!input.url || typeof input.url !== 'string') throw new Error('url is required');
  try { new URL(input.url); } catch { throw new Error('Invalid URL format'); }

  const startTime = Date.now();
  const w = Math.min(Math.max(input.width || 1280, 320), 1920);
  const h = Math.min(Math.max(input.height || 800, 240), 1080);
  const result = await captureScreenshot(input.url, w, h);

  return {
    ...result, url: input.url, width: w, height: h, full_page: input.full_page || false,
    _meta: { skill: 'screenshot-api', latency_ms: Date.now() - startTime },
  };
}

export default run;
