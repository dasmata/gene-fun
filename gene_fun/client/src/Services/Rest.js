class Rest {

    _transport;
    _headers;

    constructor(transport, headers) {
        this._transport = transport || fetch.bind(undefined);
        this._headers = new Headers([[ 'Content-Type', 'application/json' ], ...Object.entries(headers || {})]);
    }

    _getOptions(options){
        return {
            headers: this._headers,
            cache: 'no-store',
            ...(options || {})
        }
    }

    _getURL(entity, id, filters) {
        const query = Object.entries(filters || {})
            .reduce((str, entry) => `${str === '' ? str : str + '&'}${entry[0]}=${entry[1]}`, '');
        return new URL(
            `${Rest.baseURI}/${entity}${id ? '/' + id : ''}${query !== '' ? ('?' + query) : query}`,
            window.location.toString()
        );
    }

    async list(entity, options){
        const { filters, ...rest } = options || {}
        const response = await this._transport(this._getURL(entity, null, filters), {
            method: 'GET',
            ...this._getOptions(rest)
        });
        if(response.status !== 200){
            throw new Rest.Error(response.status)
        }
        return await response.json();
    }

    async get(entity, id, options) {
        const response = await this._transport(this._getURL(entity, id), {
            method: 'GET',
            ...this._getOptions(options)
        });
        if(response.status !== 200){
            throw new Rest.Error(response.status)
        }
        return await response.json();
    }

    async save(entity, data, options) {
        if (!data || Object.keys(data). length === 0) {
            throw new Error(`Invalid data received for the ${entity} entity`);
        }
        const response = await this._transport(this._getURL(entity, data.id), {
            method: data.id ? 'PATCH' : 'POST',
            ...this._getOptions({
                body: JSON.stringify(data),
                ...(options || {})
            })
        });
        if(response.status !== 200){
            throw new Rest.Error(response.status)
        }
        return await response.json();
    }

    async remove(entity, id, options) {
        if (!id) {
            throw new Error(`The id is mandatory when removing a ${entity} entity`);
        }
        const response = await this._transport(this._getURL(entity, id), {
            method: 'DELETE',
            ...this._getOptions(options)
        });
        if(response.status !== 202){
            throw new Rest.Error(response.status)
        }
        return Promise.resolve();
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