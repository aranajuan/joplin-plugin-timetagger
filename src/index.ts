import joplin from 'api';
import {ContentScriptType, ToolbarButtonLocation} from "api/types";
import {settings} from "./settings";
import {toolbar} from "./toolbar";
import {statusbar} from "./statusbar";
import {timetagger} from "./timetagger";
import {helpers} from "./helpers";

import {
    CONFIG_HOST,
    CONFIG_TOKEN,
    CONFIG_FOLDER_ENABLED,
    CONFIG_TAG_PREFIX,
    CONFIG_TAG_PREFIX_REMOVE,
    CONFIG_TITLE_FILTER,
    CONFIG_VIEW,
} from "./consts";

joplin.plugins.register({
	onStart: async function() {

		await settings.register();

		const configHost = await joplin.settings.value(CONFIG_HOST);
		const configToken = await joplin.settings.value(CONFIG_TOKEN);
		const configView = await joplin.settings.value(CONFIG_VIEW);

		async function getRecordName():Promise<string>{
			let folderEnabled = await joplin.settings.value(CONFIG_FOLDER_ENABLED);
			let tagPrefix = await joplin.settings.value(CONFIG_TAG_PREFIX);
			let tagPrefixRemove = await joplin.settings.value(CONFIG_TAG_PREFIX_REMOVE);
			let titleFilter = await joplin.settings.value(CONFIG_TITLE_FILTER);

			let nameFolder : string = "";
			let nameTags : string = "";

			const currentNote = await joplin.workspace.selectedNote();

			if (!currentNote) {
				return;
			}


			//add folders to name
			if(folderEnabled){
				let folder = await helpers.getNoteParents(currentNote.parent_id);
				folder.forEach(e=> {
					let title = /[^A-Za-z_]*(.*)/g.exec(e.title)[1];
					if(title){
						title = title.replace(/[ \.]/g,"_").toLowerCase();
						nameFolder == ""? nameFolder="#"+title : nameFolder = "#"+title + " " + nameFolder;
					}
				})
			}

			//add tags to name
			if(tagPrefix!=""){
				let prefixes = tagPrefix.split(",");
				let tags = await helpers.getAll(['notes', currentNote.id, 'tags'], { fields: ['id', 'title'], order_by: 'title', order_dir: 'ASC', page: 1 });
				tags.forEach(e=>{
					for(let i=0;i<prefixes.length;i++){
						if(e.title.startsWith(prefixes[i])){
							let title = e.title;
							if(tagPrefixRemove){
								title = title.substring(prefixes[i].length);
							}
							title = title.replace(/[ \.]/g,"_").toLowerCase();

							nameTags == ""? nameTags="#"+title : nameTags = "#"+title + " " + nameTags;
							break;
						}
					}
				});
			}

			// clean note title
			let titleFilterList = titleFilter.split(",");
			let noteTitle = currentNote.title;
			for(let i=0;i<titleFilterList.length;i++){
				var re = new RegExp(titleFilterList[i], "g");
				noteTitle = noteTitle.replace(re,"");
			}
			noteTitle = noteTitle.toLowerCase();

			return nameFolder+" "+nameTags+" "+noteTitle;
		}


		let tt = new timetagger.TimeTagger(configHost,configToken);
		let timeRunnigOtherNote = 0;

		if(configView=="panel"){
			// STATUS BAR
			let sb = new statusbar.StatusBar(
			async function(){ //start
				let name = await getRecordName();
				let response = await tt.timerStartFn(name);
				if(response == 201)
					await sb.updateStatus(name);
				else if(response == 200)
					await sb.updateStatus(name);
				else
					await joplin.views.dialogs.showMessageBox("Api error");
			},
			async function(){ //stop
				let response = await tt.timerStopFn();
				if(response == 200)
					await sb.updateStatus('-');
				else
					await joplin.views.dialogs.showMessageBox("Api error");
			},
			async function(){ // refresh
				let activeNote = await getRecordName();
				let activeTimer = await tt.getTimerRunning();

				if(activeTimer == 'api_error')
					return;

				if(activeTimer === activeNote){
					timeRunnigOtherNote=0;
				} else if (timeRunnigOtherNote==0){
					timeRunnigOtherNote = Date.now();
				} else if (timeRunnigOtherNote > 0 && (Date.now()-timeRunnigOtherNote) < (2 * 1000 * 60)){
					activeTimer = 'check timer - ' + activeTimer;
				} else{
					activeTimer = '<b class="blink"><span>[[UPDATE]]</span></b> - ' + activeTimer;
				}

				await sb.updateStatus(activeTimer);
			},
			1 // update interval (min)
			);
		}else{
			// BUTTONS
			await toolbar.register(
			async function(){ // start
				let name = await getRecordName();
				let response = await tt.timerStartFn(name);
				if(response == 201)
					await joplin.views.dialogs.showMessageBox("Started: "+name);
				else if(response == 200)
					await joplin.views.dialogs.showMessageBox("Already running");
				else
					await joplin.views.dialogs.showMessageBox("Api error");
			},
			async function(){ // stop
				let response = await tt.timerStopFn();
				if(response == 200)
					await joplin.views.dialogs.showMessageBox("All stopped");
				else
					await joplin.views.dialogs.showMessageBox("Api error");
			});
		}

	},
});
