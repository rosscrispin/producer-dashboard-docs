export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// API routes will go here
		if (url.pathname.startsWith('/api/')) {
			return new Response('Not found', { status: 404 });
		}

		// Static assets are served automatically by the assets binding
		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;

interface Env {
	ASSETS: Fetcher;
}
