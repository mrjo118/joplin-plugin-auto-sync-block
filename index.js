const TEMPORARY_NOTEBOOK_TITLE = '[Reserved]';
const UPDATE_INTERVAL_MS = 10 * 1000;
const POST_SYNC_HANDOFF_MS = 1000;

async function findTemporaryNotebook() {
	let page = 1;

	while (true) {
		const response = await joplin.data.get(['search'], {
			query: TEMPORARY_NOTEBOOK_TITLE,
			type: 'folder',
			fields: ['id', 'title', 'deleted_time'],
			include_deleted: '1',
			limit: 100,
			page,
		});

		const notebook = response.items.find(item =>
			item.title === TEMPORARY_NOTEBOOK_TITLE && item.deleted_time > 0);
		if (notebook) return notebook;
		if (!response.has_more) return null;

		page += 1;
	}
}

async function touchTrashedNotebook() {
	const now = Date.now();
	const notebook = await findTemporaryNotebook();

	if (notebook) {
		await joplin.data.put(['folders', notebook.id], null, {
			updated_time: now,
		});
	} else {
		await joplin.data.post(['folders'], null, {
			title: TEMPORARY_NOTEBOOK_TITLE,
			deleted_time: now,
		});
	}
}

joplin.plugins.register({
	onStart: async () => {
		let updatePromise = null;
		let updateInterval = null;
		let postSyncTimeout = null;

		const update = () => {
			if (!updatePromise) {
				updatePromise = touchTrashedNotebook()
					.catch(error => {
						console.error('Could not update the trashed [Reserved] notebook:', error);
					})
					.finally(() => {
						updatePromise = null;
					});
			}

			return updatePromise;
		};

		const startInterval = () => {
			updateInterval = setInterval(() => void update(), UPDATE_INTERVAL_MS);
		};

		const updateAndRestartInterval = async () => {
			if (updateInterval) {
				clearInterval(updateInterval);
				updateInterval = null;
			}

			// If a timer update was already running when sync completed, wait for it
			// and then make a distinct post-sync update.
			const pendingUpdate = updatePromise;
			if (pendingUpdate) await pendingUpdate;
			await update();
			startInterval();
		};

		await updateAndRestartInterval();
		await joplin.workspace.onSyncComplete(() => {
			if (updateInterval) {
				clearInterval(updateInterval);
				updateInterval = null;
			}
			if (postSyncTimeout) clearTimeout(postSyncTimeout);

			// Joplin publishes onSyncComplete just before its final dirty-item check.
			// Let that cleanup finish so this update does not cause a follow-up sync.
			postSyncTimeout = setTimeout(() => {
				postSyncTimeout = null;
				void updateAndRestartInterval();
			}, POST_SYNC_HANDOFF_MS);
		});
	},
});
