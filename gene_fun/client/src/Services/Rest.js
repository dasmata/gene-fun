class Rest {

    _transport;
    _headers;

    constructor(transport, headers) {
        this._transport = transport || fetch.bind(undefined);
        this._headers = new Headers([[ 'Content-Type', 'application/json' ], ...Object.entries(headers || {})]);
    }

    _getOptions(options){
        return {
            header: this._headers,
            cache: 'no-store',
            ...(options || {})
        }
    }

    _getURL(entity, filters) {
        const query = Object.entries(filters || {})
            .reduce((str, entry) => `${str === '' ? str : str + '&'}${entry[0]}=${entry[1]}`, '');
        return new URL(
            `${Rest.baseURI}/${entity}${query !== '' ? ('?' + query) : query}`,
            window.location.toString()
        );
    }

    async list(entity, options){
        const { filters, ...rest } = options || {}
        const response = await this._transport(this._getURL(entity, filters), {
            method: 'GET',
            ...this._getOptions(rest)
        });
        if(response.status !== 200){
            throw new Rest.Error(response.status)
        }
        return await response.json();
    }

    async get(entity, id) {

    }

    async save(entity, id) {

    }

    async remove(entity, id) {

    }

}

Rest.baseURI = '/api'
Rest.Error = function(statusCode, message) {
    this.statusCode = statusCode;
    this.message = message;
}
Rest.Error.prototype = new Error();
Rest.Error.prototype.constructor = Rest.Error;

export {
    Rest
}