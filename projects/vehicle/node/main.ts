import { scheduler } from 'node:timers/promises';
import { WebSocketServer } from 'ws';

const stepTime = 1 / 30 * 1000;

const server = new WebSocketServer({ port: 8080 });

let id2data: Record<string, any> = {};

let running = false;
(async function () {
    let time = Date.now();
    while (true) {
        let now = Date.now();
        const dt = now - time;
        if (dt < stepTime) {
            await scheduler.wait(stepTime - dt);
            now = Date.now()
        }
        id2data.delta = (now - time) / 1000;
        time = now;

        if (running && server.clients.size > 1) {
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

    client.on('close', () => {
        running = false;
    })

    client.on('message', (data) => {
        const text = data.toString();
        if (text == 'start') {
            running = true;
            return;
        }
        id2data[id] = Object.assign({}, id2data[id], JSON.parse(text))
    })

    client.send(JSON.stringify({ id }))
})