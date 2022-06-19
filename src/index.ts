import joplin from 'api';
import {ContentScriptType, ToolbarButtonLocation} from "api/types";
import {settings} from "./settings";
import {toolbar} from "./toolbar";
import {timetagger} from "./timetagger";
import {helpers} from "./helpers";

import {
    CONFIG_HOST,
    CONFIG_TOKEN,
    CONFIG_FOLDER_ENABLED,
    CONFIG_TAG_PREFIX,
} from "./consts";

joplin.plugins.register({
	onStart: async function() {

		await settings.register();

		const configHost = await joplin.settings.value(CONFIG_HOST);
		const configToken = await joplin.settings.value(CONFIG_TOKEN);

		async function getRecordName():Promise<string>{
			let folderEnabled = await joplin.settings.value(CONFIG_FOLDER_ENABLED);
			let tagPrefix = await joplin.settings.value(CONFIG_TAG_PREFIX);

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
					let title = e.title.match(/([A-Z]*[a-z]*)/);
					nameFolder == ""? nameFolder="#"+title[0] : nameFolder = "#"+title[0] + " " + nameFolder;
				})
			}

			//add tags to name
			if(tagPrefix!=""){
				let prefixes = tagPrefix.split(",");
				let tags = await helpers.getAll(['notes', currentNote.id, 'tags'], { fields: ['id', 'title'], order_by: 'title', order_dir: 'ASC', page: 1 });
				tags.forEach(e=>{
					for(let i=0;i<prefixes.length;i++){
						if(e.title.startsWith(prefixes[i])){
							nameTags == ""? nameTags="#"+e.title : nameTags = "#"+e.title + " " + nameTags;
							break;
						}
					}
				});
			}

			return nameFolder+" "+nameTags+" "+currentNote.title;
		}


		let tt = new timetagger.TimeTagger(configHost,configToken,getRecordName);

		await toolbar.register(tt.timerStartFn.bind(tt), tt.timerStopFn.bind(tt));

	},
});
