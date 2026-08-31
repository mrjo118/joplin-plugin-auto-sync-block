# Auto Sync Block

This desktop-only Joplin plugin creates a notebook named `[Reserved]` directly
in the trash, or updates an existing trashed notebook with that exact name. It
updates the notebook every 10 seconds. Joplin's desktop sync-as-you-type delay
is currently 15 seconds, so these changes keep rescheduling that sync while
the plugin is running. After a sync completes, the plugin updates the notebook
and restarts the 10-second timer from that point.

## Install

In Joplin, open **Tools > Options > Plugins**, select the gear menu, choose
**Install from file**, and select `plugin.mrjo118.auto-sync-block.jpl`.

Restart Joplin after installation. Disable Joplin's regular synchronization
interval as well; this plugin only postpones sync-as-you-type and does not
affect the independent recurrent-sync timer. If you do not wish to see the
[Reserved] notebook in the trash, you can collapse the trash to avoid showing
all folders under it. Note that if you empty the trash, the notebook is
automatically re-created, so deleting it is not an issue.
