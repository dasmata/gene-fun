class Logger {

    _transport;

    constructor(transport){
        this._transport = transport || {
            sendBeacon: (...params) => console.log(...params)
        }
    }

    _getDefaultParams() {
        return {
            time: new Date().getTime(),
            hostname: window.location.hostname,
            pathname: window.location.pathname,
            query: window.location.search,
            hash: window.location.hash,
            port: window.location.port,
            protocol: window.location.protocol
        }
    }


    warn(code, message) {
        this._transport.sendBeacon({
            ...this._getDefaultParams(),
            lvl: 'warning',
            code: code,
            message: message,
        })
    }

    error(code, message) {
        this._transport.sendBeacon({
            ...this._getDefaultParams(),
            lvl: 'error',
            code: code,
            message: message,
        })
    }

    info(code, message) {
        this._transport.sendBeacon({
            ...this._getDefaultParams(),
            lvl: 'info',
            code: code,
            message: message,
        })
    }

}

export {
    Logger
}