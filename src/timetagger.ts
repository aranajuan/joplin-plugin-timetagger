import joplin from 'api';
const crypto = require('crypto');

export namespace timetagger {

	export class TimeTagger{
		
		serverHost : string
		serverToken : string

		constructor(host: string ,token : string){
			if(host.endsWith("/")){
				host = host.slice(0,-1);
			}
			if(host.indexOf("/api")>0){
				// full URL, assume that user knows what to do
				this.serverHost=host;
			} else if(host=="https://timetagger.app"){
				// Using timetagger.app service
				this.serverHost=host+"/api/v2";
			}else{
				// assume default self-hosting API endpoint
				this.serverHost=host+"/timetagger/api/v2";
			}
			this.serverToken=token;
		}

		private async startRecord(name : string): Promise<number>{
			let now = Math.floor(new Date().getTime()/1000);
			let activeRecords = await this.getRunnigRecords();

			//check if new name is already running
			if(activeRecords.find(e => e.ds == name)!=undefined){
				return 200;
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
    			return 500;
    		}
    		return 201;
		}

		private async stopRecords(records : any[]): Promise<number>{
			let now = Math.floor(new Date().getTime()/1000);
			const stopRecords: any[] = new Array();
			records.forEach(e=> {
				if(e.t1==e.t2){
					e.t2=now;
					stopRecords.push(e);
				}
			});
			if(stopRecords.length == 0){
				return 200;
			}

			let headers = new Headers({
			  "authtoken": this.serverToken,
			});
			let response = await fetch(`${this.serverHost}/records`,{method:"PUT",headers:headers,body: JSON.stringify(stopRecords)});
    		if(response.status!=200){
    			return 500;
    		}
    		return 200;
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
    			return null;
    		}
    		let recordList = await response.json();
    		recordList.records.forEach(e => {
    			if(e.t1==e.t2){
    				activeRecords.push(e);    				
    			}
    		})
    		return activeRecords;
		}


		async timerStartFn(title: string): Promise<number>{
			return await this.startRecord(title.toLowerCase());
		}

		async timerStopFn(): Promise<number>{
			let activeRecords = await this.getRunnigRecords();
			if(activeRecords==null)
				return 500;
			return await this.stopRecords(activeRecords);
		}

		async getTimerRunning(): Promise<string>{
			let activeRecords = await this.getRunnigRecords();
			if(activeRecords==null)
				return 'api_error';
			if(activeRecords.length==0)
				return '';
			return activeRecords[0].ds;
		}

	}

}
