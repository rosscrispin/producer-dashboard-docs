// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import copySource from './src/integrations/copy-source';

export default defineConfig({
	integrations: [
		starlight({
			title: 'Producer Dashboard',
			description: 'Help documentation for Producer Dashboard — the music production management platform.',
			customCss: ['./src/styles/custom.css'],
			components: {
				PageSidebar: './src/components/starlight/PageSidebar.astro',
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ slug: 'getting-started' },
						{ slug: 'getting-started/download-and-install' },
						{ slug: 'getting-started/creating-your-account' },
						{ slug: 'getting-started/quick-start' },
						{ slug: 'getting-started/your-first-import' },
						{ slug: 'getting-started/your-first-project' },
						{ slug: 'getting-started/quick-tour' },
					],
				},
				{
					label: 'Managing Your Music',
					items: [
						{ slug: 'managing-your-music/songs-and-track-groups' },
						{ slug: 'managing-your-music/the-tracks-grid' },
						{ slug: 'managing-your-music/importing-tracks' },
						{ slug: 'managing-your-music/editing-track-details' },
						{ slug: 'managing-your-music/searching-and-filtering' },
						{ slug: 'managing-your-music/playing-and-previewing' },
						{ slug: 'managing-your-music/saved-searches' },
						{ slug: 'managing-your-music/bulk-editing' },
						{ slug: 'managing-your-music/column-management' },
					],
				},
				{
					label: 'Projects',
					items: [
						{ slug: 'projects/creating-projects' },
						{ slug: 'projects/project-hierarchy' },
						{ slug: 'projects/assigning-songs' },
						{ slug: 'projects/project-due-dates' },
						{ slug: 'projects/multi-project-selection' },
					],
				},
				{
					label: 'Workflow & Stages',
					items: [
						{ slug: 'workflow-and-stages/understanding-stages' },
						{ slug: 'workflow-and-stages/custom-workflows' },
						{ slug: 'workflow-and-stages/tracking-progress' },
						{ slug: 'workflow-and-stages/due-dates-and-deadlines' },
					],
				},
				{
					label: 'Tags & Metadata',
					items: [
						{ slug: 'tags-and-metadata/using-tags' },
						{ slug: 'tags-and-metadata/managing-tags-and-categories' },
						{ slug: 'tags-and-metadata/musical-attributes' },
						{ slug: 'tags-and-metadata/audio-analysis' },
					],
				},
				{
					label: 'Audio Player',
					items: [
						{ slug: 'audio-player/the-waveform-player' },
						{ slug: 'audio-player/playback-controls' },
						{ slug: 'audio-player/playback-modes' },
						{ slug: 'audio-player/waveform-interactions' },
						{ slug: 'audio-player/versions-and-stems' },
						{ slug: 'audio-player/player-contexts' },
						{ slug: 'audio-player/supported-formats' },
					],
				},
				{
					label: 'Comments & Todos',
					items: [
						{ slug: 'comments-and-todos/adding-comments' },
						{ slug: 'comments-and-todos/timestamped-comments' },
						{ slug: 'comments-and-todos/pinning-comments' },
						{ slug: 'comments-and-todos/editing-and-deleting-comments' },
						{ slug: 'comments-and-todos/comments-on-shared-tracks' },
						{ slug: 'comments-and-todos/creating-todos' },
						{ slug: 'comments-and-todos/todo-properties' },
						{ slug: 'comments-and-todos/managing-todos' },
						{ slug: 'comments-and-todos/todos-in-your-workflow' },
					],
				},
				{
					label: 'Collaboration',
					items: [
						{ slug: 'collaboration/adding-collaborators' },
						{ slug: 'collaboration/splits-and-rights' },
						{ slug: 'collaboration/sharing-with-collaborators' },
						{ slug: 'collaboration/permissions' },
						{ slug: 'collaboration/invitations' },
						{ slug: 'collaboration/default-project-collaborators' },
						{ slug: 'collaboration/unsharing-and-leaving' },
					],
				},
				{
					label: 'Sharing',
					items: [
						{ slug: 'sharing' },
						{ slug: 'sharing/creating-share-links' },
						{ slug: 'sharing/share-settings' },
						{ slug: 'sharing/the-share-page' },
						{ slug: 'sharing/playlist-sharing' },
						{ slug: 'sharing/managing-share-links' },
						{ slug: 'sharing/tracking-engagement' },
						{ slug: 'sharing/when-to-use-what' },
						{
							label: 'Public Page',
							items: [
								{ slug: 'sharing/public-page' },
								{ slug: 'sharing/public-page/setting-up' },
								{ slug: 'sharing/public-page/adding-content' },
								{ slug: 'sharing/public-page/visitor-experience' },
								{ slug: 'sharing/public-page/preview-and-publish' },
							],
						},
					],
				},
				{
					label: 'Dashboard',
					items: [
						{ slug: 'dashboard' },
						{ slug: 'dashboard/featured-projects' },
						{ slug: 'dashboard/mini-kanban' },
						{ slug: 'dashboard/upcoming-deadlines' },
						{ slug: 'dashboard/abandoned-tracks' },
						{ slug: 'dashboard/dashboard-vs-tracks' },
					],
				},
				{
					label: 'Activity Panel',
					items: [
						{ slug: 'activity-panel' },
						{ slug: 'activity-panel/overview-widget' },
						{ slug: 'activity-panel/artwork-widget' },
						{ slug: 'activity-panel/comments-widget' },
						{ slug: 'activity-panel/todos-widget' },
						{ slug: 'activity-panel/tags-widget' },
						{ slug: 'activity-panel/stage-workflow-widget' },
						{ slug: 'activity-panel/musical-attributes-widget' },
						{ slug: 'activity-panel/files-widget' },
						{ slug: 'activity-panel/collaborators-widget' },
						{ slug: 'activity-panel/due-date-widget' },
						{ slug: 'activity-panel/export-widget' },
						{ slug: 'activity-panel/bucket-widget' },
						{ slug: 'activity-panel/lyrics-widget' },
						{ slug: 'activity-panel/track-warnings-widget' },
						{ slug: 'activity-panel/marketing-widget' },
					],
				},
				{
					label: 'Activity & Notifications',
					items: [
						{ slug: 'activity-and-notifications/the-activity-feed' },
						{ slug: 'activity-and-notifications/smart-notifications' },
						{ slug: 'activity-and-notifications/how-notifications-appear' },
						{ slug: 'activity-and-notifications/notification-settings' },
						{ slug: 'activity-and-notifications/daily-workflow' },
					],
				},
				{
					label: 'Licensing',
					items: [
						{ slug: 'licensing/setting-up' },
						{ slug: 'licensing/creating-license-types' },
						{ slug: 'licensing/pricing-your-beats' },
						{ slug: 'licensing/purchase-flow' },
						{ slug: 'licensing/managing-sales' },
					],
				},
				{
					label: 'Export',
					items: [
						{ slug: 'export/split-sheets' },
						{ slug: 'export/track-metadata' },
						{ slug: 'export/writer-roles-and-ipi' },
					],
				},
				{
					label: 'Settings',
					items: [
						{ slug: 'settings/profile-and-avatar' },
						{ slug: 'settings/background-and-theme' },
						{ slug: 'settings/connected-accounts' },
						{ slug: 'settings/connecting-dropbox' },
						{ slug: 'settings/dropbox-for-teams' },
						{ slug: 'settings/managing-dropbox-connection' },
						{ slug: 'settings/how-files-are-organized' },
						{ slug: 'settings/billing-and-subscription' },
						{ slug: 'settings/notifications' },
						{ slug: 'settings/social-media-links' },
						{ slug: 'settings/pro-ipi-info' },
						{ slug: 'settings/account-management' },
					],
				},
				{
					label: 'AI Assistant',
					items: [
						{ slug: 'ai-assistant/using-the-assistant' },
						{ slug: 'ai-assistant/what-you-can-ask' },
						{ slug: 'ai-assistant/example-queries' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ slug: 'reference/keyboard-shortcuts' },
						{ slug: 'reference/plan-limits' },
						{ slug: 'reference/supported-file-formats' },
						{ slug: 'reference/undo-redo' },
						{ slug: 'reference/realtime-sync' },
					],
				},
			],
		}),
		copySource(),
	],
});
