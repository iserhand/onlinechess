const express = require('express');
const http = require('http');
const port = 8082;
const server = http.createServer(express);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
let whiteOpponent = false;
let blackOpponent = false;
let spectators = [];
wss.on('connection', (ws) => {
	console.log('Client connected');
	console.log(ws._socket.remoteAddress);
	if (!whiteOpponent) {
		whiteOpponent = ws;
		ws.send(Buffer.from('WHITE', 'utf-8'));
	} else if (whiteOpponent && !blackOpponent) {
		blackOpponent = ws;
		ws.send(Buffer.from('BLACK', 'utf-8'));
	} else {
		spectators.push(ws);
		ws.send(Buffer.from('SPECTATOR', 'utf-8'));
	}

	ws.on('message', function (data) {
		data = data.toString();
		console.log(data);
		if (data.startsWith('msg')) {
			wss.clients.forEach(function each(client) {
				if (client != ws && client.readyState == WebSocket.OPEN) {
					if (whiteOpponent == ws) {
						client.send(
							Buffer.concat([
								Buffer.from('White :', 'utf-8'),
								Buffer.from(data, 'utf-8'),
							])
						);
					} else if (blackOpponent == ws) {
						client.send(
							Buffer.concat([
								Buffer.from('Black :', 'utf-8'),
								Buffer.from(data, 'utf-8'),
							])
						);
					} else {
						client.send(
							Buffer.concat([
								Buffer.from(`Spectator #${spectators.indexOf(ws) + 1} :`, 'utf-8'),
								Buffer.from(data, 'utf-8'),
							])
						);
					}
				}
			});
		} else if (data.startsWith('mov')) {
			//Movement message
			let splitMsg = data.split(',');
			wss.clients.forEach(function each(client) {
				if (client != ws && client.readyState == WebSocket.OPEN) {
					if (blackOpponent == client) {
						//Send move reversed
						client.send(
							Buffer.from(
								`mov,${(7 - parseInt(splitMsg[2])).toString()},${(
									7 - parseInt(splitMsg[3])
								).toString()},${(7 - parseInt(splitMsg[4])).toString()},${(
									7 - parseInt(splitMsg[5])
								).toString()}`,
								'utf-8'
							)
						);
						console.log(
							'Sent',
							`mov,${(7 - parseInt(splitMsg[2])).toString()},${(
								7 - parseInt(splitMsg[3])
							).toString()},${(7 - parseInt(splitMsg[4])).toString()},${(
								7 - parseInt(splitMsg[5])
							).toString()}`,
							'utf-8'
						);
					} else {
						if (splitMsg[1] === 'b') {
							//Black's move so reverse the move
							console.log('black moved');
							client.send(
								Buffer.from(
									`mov,${(7 - parseInt(splitMsg[2])).toString()},${(
										7 - parseInt(splitMsg[3])
									).toString()},${(7 - parseInt(splitMsg[4])).toString()},${(
										7 - parseInt(splitMsg[5])
									).toString()}`,
									'utf-8'
								)
							);
						} else {
							//Send move directly(white move)
							console.log('white moved');
							client.send(
								Buffer.from(
									`mov,${splitMsg[2]},${splitMsg[3]},${splitMsg[4]},${splitMsg[5]}`,
									'utf-8'
								)
							);
						}
					}
				}
			});
		}
	});

	ws.on('close', () => {
		if (ws == whiteOpponent) {
			whiteOpponent = false;
		} else if (ws == blackOpponent) {
			blackOpponent = false;
		} else {
			spectators.splice(spectators.indexOf(ws), 1);
		}
		console.log('Client dced');
	});
});
server.listen(port, function () {
	console.log(`server is listening on port: ${port}`);
});
