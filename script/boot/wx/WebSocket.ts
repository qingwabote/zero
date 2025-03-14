export class WebSocket {
    private readonly _socket: WechatMinigame.SocketTask;

    set onopen(value: () => void) {
        this._socket.onOpen(value);
    }

    set onclose(value: () => void) {
        this._socket.onClose(value);
    }

    set onmessage(value: (e: WechatMinigame.SocketTaskOnMessageListenerResult) => void) {
        this._socket.onMessage(value)
    }

    constructor(url: string) {
        this._socket = wx.connectSocket({ url })
    }

    send(data: string): void {
        this._socket.send({ data })
    }
}