
class Training {

    _storageService;

    constructor(storageService){
        this._storageService = storageService
    }

    async getAll(page, options){
        const limit = options?.perPage || Training.perPage;
        const offset = ((page || 1) - 1) * Training.perPage;
        try {
            return await this._storageService.list('training', {
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

    async create(name) {
        try {
            return await this._storageService.save('training', {
                name
            })
        } catch (e) {
            return Promise.reject();
        }
    }

    async remove(trainingId){
        try {
            return await this._storageService.remove('training', trainingId)
        } catch (e) {
            return Promise.reject();
        }
    }
}

Training.perPage = 20;

export {
    Training
}