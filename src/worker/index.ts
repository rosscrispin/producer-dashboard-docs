export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api/')) {
			return handleApi(url, request, env);
		}

		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;

interface Env {
	ASSETS: Fetcher;
	HELP_API_KEY: string;
}

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
	});
}

function authorize(request: Request, env: Env): boolean {
	const header = request.headers.get('Authorization');
	if (!header?.startsWith('Bearer ')) return false;
	return header.slice(7) === env.HELP_API_KEY;
}

function assetRequest(request: Request, path: string): Request {
	const url = new URL(request.url);
	url.pathname = path;
	return new Request(url.toString(), request);
}

async function handleApi(url: URL, request: Request, env: Env): Promise<Response> {
	if (request.method === 'OPTIONS') {
		return new Response(null, { status: 204, headers: CORS_HEADERS });
	}

	if (!authorize(request, env)) {
		return json({ error: 'Unauthorized' }, 401);
	}

	try {
		// GET /api/help/index — full content list with summaries
		if (url.pathname === '/api/help/index') {
			const res = await env.ASSETS.fetch(assetRequest(request, '/data/docs-index.json'));
			if (!res.ok) return json({ error: 'Index not found' }, 404);
			const data = await res.json();
			return json(data);
		}

		// GET /api/help/article/<slug> — full article content
		const articleMatch = url.pathname.match(/^\/api\/help\/article\/(.+)$/);
		if (articleMatch) {
			const slug = articleMatch[1];
			const res = await env.ASSETS.fetch(assetRequest(request, `/_source/${slug}.mdx`));
			if (res.ok) {
				return returnArticle(slug, await res.text());
			}
			// Try index.mdx for section root pages
			const indexRes = await env.ASSETS.fetch(assetRequest(request, `/_source/${slug}/index.mdx`));
			if (indexRes.ok) {
				return returnArticle(slug, await indexRes.text());
			}
			return json({ error: 'Article not found' }, 404);
		}

		// GET /api/help/related/<slug> — connected articles from graph
		const relatedMatch = url.pathname.match(/^\/api\/help\/related\/(.+)$/);
		if (relatedMatch) {
			const slug = relatedMatch[1];
			const res = await env.ASSETS.fetch(assetRequest(request, '/data/docs-graph.json'));
			if (!res.ok) return json({ error: 'Graph not found' }, 404);
			const graph = await res.json() as Record<string, Array<{ slug: string; reason: string }>>;
			return json({ slug, related: graph[slug] || [] });
		}

		return json({ error: 'Not found' }, 404);
	} catch (err) {
		return json({ error: String(err) }, 500);
	}
}

function returnArticle(slug: string, raw: string): Response {
	const { frontmatter, body } = parseFrontmatter(raw);
	return json({
		slug,
		title: frontmatter.title || '',
		description: frontmatter.description || '',
		ui_location: frontmatter.ui_location || '',
		depends_on: frontmatter.depends_on || [],
		used_by: frontmatter.used_by || [],
		content: body,
	});
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, unknown>; body: string } {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return { frontmatter: {}, body: raw };

	const fm: Record<string, unknown> = {};
	let currentKey = '';
	let collectingArray = false;
	const arrayItems: string[] = [];

	for (const line of match[1].split('\n')) {
		if (collectingArray) {
			const itemMatch = line.match(/^\s+-\s+"(.*)"$/);
			if (itemMatch) {
				arrayItems.push(itemMatch[1]);
				continue;
			}
			fm[currentKey] = [...arrayItems];
			arrayItems.length = 0;
			collectingArray = false;
		}

		const kvMatch = line.match(/^(\w+):\s*(.*)$/);
		if (!kvMatch) continue;

		const [, key, value] = kvMatch;
		if (value.trim() === '' || value.trim() === '[]') {
			if (value.trim() === '[]') {
				fm[key] = [];
			} else {
				currentKey = key;
				collectingArray = true;
			}
		} else {
			fm[key] = value.replace(/^"(.*)"$/, '$1');
		}
	}

	if (collectingArray) {
		fm[currentKey] = [...arrayItems];
	}

	return { frontmatter: fm, body: match[2].trim() };
}
