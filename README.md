# Auto Sync Block

This desktop-only Joplin plugin creates a notebook named `[Reserved]` directly
in the trash, or updates an existing trashed notebook with that exact name. It
updates the notebook every 10 seconds. Joplin's desktop sync-as-you-type delay
is currently 15 seconds, so these changes keep rescheduling that sync while
the plugin is running. While a sync is running, the plugin pauses its updates.
After the sync completes, it restarts the 10-second timer, with the next update
occurring on the first timer tick. The automatically triggered sync upon
starting and exiting the app remains unaffected.

On the mobile app, using the same approach would be too aggressive, as the
sync-as-you-type delay is only 1 second, and making updates more frequently
would drain a lot of battery. However, an existing workaround for mobile exists.
In Joplin, open **Configuration > Synchronisation**, and enable the
**Synchronise only over WiFi connection** setting. Then, so long as you are
connected to internet via mobile internet only, the sync will not automatically
trigger while typing, if you disable Joplin's regular synchronization
interval as well.

## Install

In Joplin, open **Tools > Options > Plugins**, select the gear menu, choose
**Install from file**, and select `plugin.mrjo118.auto-sync-block.jpl`.

Restart Joplin after installation. Disable Joplin's regular synchronization
interval as well; this plugin only postpones sync-as-you-type and does not
affect the independent recurrent-sync timer. If you do not wish to see the
[Reserved] notebook in the trash, you can collapse the trash to avoid showing
all folders under it. Note that if you empty the trash, the notebook is
automatically re-created, so deleting it is not an issue.

Something worth noting: when you set up a new device with the plugin installed,
you will see a duplicate of the `[Reserved]` notebook is created after the
device syncs. This happens because the plugin cannot initially see the notebook
that already exists on the sync target. You can delete either one or all of the
`[Reserved]` notebooks; the plugin will then re-create just one if necessary.
