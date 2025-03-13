import { scheduler } from 'node:timers/promises';
import { WebSocketServer } from 'ws';

const stepTime = 1 / 30 * 1000;

const server = new WebSocketServer({ port: 8080 });

let id2data: Record<number, any> = {};

(async function () {
    let time = Date.now();
    while (true) {
        const now = Date.now();
        const dt = now - time;
        if (dt < stepTime) {
            await scheduler.wait(stepTime - dt);
        }
        time = now;

        if (server.clients.size > 1) {
            for (const client of server.clients) {
                client.send(JSON.stringify(id2data));
            }
        }
        id2data = {};
    }
})()

server.on('connection', (client, request) => {
    // const id = server.clients.size;
    const id = 1;

    client.on('message', (data) => {
        id2data[id] = Object.assign({}, id2data[id], JSON.parse(data.toString()))
    })

    client.send(JSON.stringify({ id }))
})