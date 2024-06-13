declare const wx: any;

wx.onError(function (e: any) {
    wx.showModal({ title: e.message, content: e.stack })
})

wx.onUnhandledRejection(function ({ reason }: any) {
    const t = typeof reason;
    switch (t) {
        case 'object':
            wx.showModal({ title: reason.message, content: reason.stack })
            break;
        case 'string':
            wx.showModal({ title: 'unhandled rejection', content: reason })
            break;
        default:
            wx.showModal({ title: 'unsupported reason type', content: t })
            break;
    }
})

export { };
