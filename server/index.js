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
