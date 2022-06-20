import joplin from 'api';
const crypto = require('crypto');

export namespace timetagger {

	export class TimeTagger{
		
		serverHost : string
		serverToken : string
		getTitle : Function

		constructor(host: string ,token : string, getTitle : Function){
			this.serverHost=host+"/timetagger/api/v2";
			this.serverToken=token;
			this.getTitle=getTitle;
		}

		private async startRecord(name : string){
			let now = Math.floor(new Date().getTime()/1000);
			let activeRecords = await this.getRunnigRecords();

			//check if new name is already running
			if(activeRecords.find(e => e.ds == name)!=undefined){
				await joplin.views.dialogs.showMessageBox("Already running: "+name);

				return;
			}

			await this.stopRecords(activeRecords);

			let newRecord = [{
				"key": crypto.randomUUID(),
		        "t1": now,
		        "t2": now,
		        "mt": new Date().getTime()/1000,
		        "st": 0,
		        "ds": name,
			}];

			let headers = new Headers({
			  "authtoken": this.serverToken,
			});
			let response = await fetch(`${this.serverHost}/records`,{method:"PUT",headers:headers,body: JSON.stringify(newRecord)});
    		if(response.status!=200){
    			await joplin.views.dialogs.showMessageBox("Error TimeTagger api");
    		}
    		await joplin.views.dialogs.showMessageBox("Started: "+name);
		}

		private async stopRecords(records : any[]){
			let now = Math.floor(new Date().getTime()/1000);
			const stopRecords: any[] = new Array();
			records.forEach(e=> {
				if(e.t1==e.t2){
					e.t2=now;
					stopRecords.push(e);
				}
			});
			if(stopRecords.length == 0){
				return;
			}

			let headers = new Headers({
			  "authtoken": this.serverToken,
			});
			let response = await fetch(`${this.serverHost}/records`,{method:"PUT",headers:headers,body: JSON.stringify(stopRecords)});
    		if(response.status!=200){
    			await joplin.views.dialogs.showMessageBox("Error TimeTagger api");
    		}
		}

		private async getRunnigRecords(): Promise<any[]>{
			const activeRecords: any[] = new Array();
			let now = Math.floor(new Date().getTime()/1000);
    		let t1 = now - (60*60*2);
    		let t2 = now + 60;
    		let headers = new Headers({
			  "authtoken": this.serverToken,
			});
    		let response = await fetch(`${this.serverHost}/records?timerange=${t1}-${t2}`,{method:"GET",headers:headers});
    		if(response.status!=200){
    			await joplin.views.dialogs.showMessageBox("Error TimeTagger api");
    			return activeRecords;
    		}
    		let recordList = await response.json();
    		recordList.records.forEach(e => {
    			if(e.t1==e.t2){
    				activeRecords.push(e);    				
    			}
    		})
    		return activeRecords;
		}


		async timerStartFn(){
			
			let title = await this.getTitle();
			this.startRecord(title.toLowerCase());
			console.log("start: "+title);
		}

		async timerStopFn(){
			console.log("stop");
			let activeRecords = await this.getRunnigRecords();
			await this.stopRecords(activeRecords);
			await joplin.views.dialogs.showMessageBox("All stopped");
		}

	}

}