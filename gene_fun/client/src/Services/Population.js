class Population {

    _storageService;

    constructor(storageService){
        this._storageService = storageService
    }

    async getAll(page, options){
        const limit = options?.perPage || Population.perPage;
        const offset = ((page || 1) - 1) * Population.perPage;
        try {
            return await this._storageService.list('population', {
                filters: {
                    limit,
                    offset,
                    ...(options?.filters || {})
                }
            })
        } catch (e) {
            return Promise.reject();
        }
    }

}

Population.perPage = 20;

export {
    Population
}