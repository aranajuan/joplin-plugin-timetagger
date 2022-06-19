import joplin from "api";
import { MenuItemLocation, ToolbarButtonLocation ,MenuItem} from 'api/types';

export namespace toolbar {
    export async function register(timerStart,timerStop) {


    	await joplin.commands.register({
			name: 'timer_start',
			label: 'Timer Start',
			iconName: 'fas fa-hourglass-start',
			execute: async () => {
				timerStart();
			},
		});

		await joplin.commands.register({
			name: 'timer_stop',
			label: 'Timer Stop',
			iconName: 'fas fa-hourglass-end',
			execute: async () => {
				timerStop();
			},
		});


	    const commandsSubMenu: MenuItem[] = [
	      {
	        commandName: 'timer_start',
	        label: 'Start'
	      },
	      {
	        commandName: 'timer_stop',
	        label: 'Stop'
	      },

	    ];
    	await joplin.views.menus.create('toolsTimer', 'TimeTagger', commandsSubMenu, MenuItemLocation.Tools);

        await joplin.views.toolbarButtons.create('timer_start_button', 'timer_start', ToolbarButtonLocation.NoteToolbar);
        await joplin.views.toolbarButtons.create('timer_stop_button', 'timer_stop', ToolbarButtonLocation.NoteToolbar);



    }
}