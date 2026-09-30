const TEMPORARY_NOTEBOOK_TITLE = '[Reserved]';
const UPDATE_INTERVAL_MS = 10 * 1000;

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

async function touchTrashedNotebook(shouldUpdate = () => true) {
	const now = Date.now();
	const notebook = await findTemporaryNotebook();
	if (!shouldUpdate()) return;

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
		let syncInProgress = false;

		const stopInterval = () => {
			if (updateInterval) {
				clearInterval(updateInterval);
				updateInterval = null;
			}
		};

		const update = () => {
			if (syncInProgress) return Promise.resolve();

			if (!updatePromise) {
				updatePromise = touchTrashedNotebook(() => !syncInProgress)
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
			if (syncInProgress || updateInterval) return;
			updateInterval = setInterval(() => void update(), UPDATE_INTERVAL_MS);
		};

		const initializeAndStartInterval = async () => {
			stopInterval();

			// Avoid overlapping with an update that may already be in progress.
			const pendingUpdate = updatePromise;
			if (pendingUpdate) await pendingUpdate;
			if (syncInProgress) return;
			await update();
			if (syncInProgress) return;
			startInterval();
		};

		await joplin.workspace.onSyncStart(() => {
			syncInProgress = true;
			stopInterval();
		});
		await joplin.workspace.onSyncComplete(() => {
			syncInProgress = false;
			stopInterval();
			startInterval();
		});
		await initializeAndStartInterval();
	},
});
