const ws = new WebSocket('ws://192.168.1.104:8082');
const sendBtn = document.getElementById('send');
const messages = document.getElementById('messages');
const input = document.getElementById('messageIn');
const userType = document.getElementById('userType');

ws.addEventListener('open', () => {
	console.log('Websocket on baby');
});
ws.addEventListener('message', (ev) => {
	ev.data.text().then((text) => {
		if (text === 'WHITE') {
			userType.textContent = 'You are white';
			userTypeString = 'w';
			drawBoard();
		} else if (text === 'BLACK') {
			userType.textContent = 'You are black';
			userTypeString = 'b';
			board.map(function (arr) {
				return arr.reverse();
			});
			board.reverse();
			drawBoard();
		} else if (text === 'SPECTATOR') {
			userType.textContent = 'You are spectator';
			userTypeString = 's';
			drawBoard();
		} else if (text.split(':')[1]?.startsWith('msg')) {
			text = text.split(':')[0] + ':' + text.split(':')[1].slice(3);
			showMessage(text);
		} else if (text.split(',')[0]?.startsWith('mov')) {
			let splittedTextFromServer = text.split(',');
			moveFromServer(
				splittedTextFromServer[1],
				splittedTextFromServer[2],
				splittedTextFromServer[3],
				splittedTextFromServer[4]
			);
			console.log(text);
		} else {
			console.log(text);
		}
	});
});
ws.onclose = () => {
	console.log('Websocket off man');
};

sendBtn.onclick = function () {
	if (!ws) {
		showMessage('No connection');
		return;
	}
	sendMessage(input.value);
};
function showMessage(message) {
	messages.textContent += `${message}\n`;
	messages.scrollTop = messages.scrollHeight;
}
function sendMessage(message) {
	ws.send('msg' + input.value);
	input.value = '';
	messages.textContent += `Me:${message}\n`;
	messages.scrollTop = messages.scrollHeight;
}
