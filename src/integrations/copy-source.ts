import type { AstroIntegration } from 'astro';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export default function copySource(): AstroIntegration {
	return {
		name: 'copy-source',
		hooks: {
			'astro:build:done': ({ dir }) => {
				const srcDir = join(process.cwd(), 'src', 'content', 'docs');
				const destDir = join(dir.pathname, '_source');

				if (!existsSync(srcDir)) return;

				mkdirSync(destDir, { recursive: true });
				cpSync(srcDir, destDir, { recursive: true });
			},
		},
	};
}
