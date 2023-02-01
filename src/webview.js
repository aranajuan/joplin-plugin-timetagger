document.addEventListener('click', event => {
	const element = event.target;
	if (element.id === 'startTimer') {
		// Post the message and slug info back to the plugin:
		webviewApi.postMessage({
			command: 'start_timer',
		});
	}
	if (element.id === 'stopTimer') {
		// Post the message and slug info back to the plugin:
		webviewApi.postMessage({
			command: 'stop_timer',
		});
	}
});