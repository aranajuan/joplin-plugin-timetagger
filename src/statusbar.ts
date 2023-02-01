import joplin from 'api';
import { ViewHandle } from 'api/types';

export namespace statusbar {

	export class StatusBar{
		// prepare panel object
		panel : ViewHandle
		timerStartFN : Function
		timerStopFN: Function
		timerStatusFN: Function
		updateInterval: number
		timer: ReturnType<typeof setTimeout>


		constructor(timerStart, timerStop, timerStatus, updateInterval){
			this.timerStartFN=timerStart;
			this.timerStopFN=timerStop;
			this.timerStatusFN=timerStatus;
			this.updateInterval=updateInterval;
			this.startStatus();
		}

		private async startStatus(){
			this.panel  = await joplin.views.panels.create('tt_status');
			await joplin.views.panels.addScript(this.panel, './webview.css');
			await joplin.views.panels.addScript(this.panel, './webview.js');

			await joplin.views.panels.setHtml(this.panel, 'Loading...');
			await joplin.views.panels.onMessage(this.panel, (message) => {
				if (message.command === 'start_timer') {
					this.timerStartFN();
				}
				if (message.command === 'stop_timer') {
					this.timerStopFN();
				}
			});

			this.updateStatus('--');
			this.timerStatusFN();

			this.setTimer();
		}


		private runTimed() {
			this.timerStatusFN();
			this.setTimer();
		}

		private setTimer() {
		    clearTimeout(this.timer);
		    this.timer = null;
		    this.timer = setTimeout(this.runTimed.bind(this), 1000 * 60 * this.updateInterval);
		}

		async updateStatus(msg: string){
			await joplin.views.panels.setHtml(this.panel, `
				  <div class="editor-toolbar container">
						<div style="padding: 4px; float: right">
							<i class="toolbarIcon primary">${msg}</i>
							<a title="Timer Start" href="#"><i class="button toolbarIcon primary fas fa-hourglass-start" id="startTimer" title=""></i></a>
							<a title="Timer Stop" href="#"><i class="button toolbarIcon primary fas fa-hourglass-end" id="stopTimer" title=""></i></a>
						</div>
					</div>
				`);
		}


	}
}

