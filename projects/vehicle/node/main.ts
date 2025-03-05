import { scheduler } from 'node:timers/promises';
import { WebSocketServer } from 'ws';

const stepTime = 1 / 30 * 1000;

const server = new WebSocketServer({ port: 8080 });

let id2data: Record<number, any> = {};

(async function () {
    while (true) {
        await scheduler.wait(stepTime);
        for (const client of server.clients) {
            client.send(JSON.stringify(id2data));
        }
        id2data = {};
    }
})()

server.on('connection', (client, request) => {
    const id = server.clients.size;

    client.on('message', (data) => {
        id2data[id] = Object.assign({}, id2data[id], JSON.parse(data.toString()))
    })

    client.send(JSON.stringify({ id }))
})