class Base {
    _queryParams;
    _serviceContainer;
    _loader;

    constructor(serviceContainer) {
        this._serviceContainer = serviceContainer;
        this._queryParams = new URLSearchParams(window.location.search);
        this._loader = document.querySelector('.page-loader');
    }

    navigate(page, params) {
        this.showLoader();

        const {search, ...restParams} = params;
        let url = page;
        if (search) {
            url = `${url}?${Object.entries(search)
                .reduce(
                    (queryParams, entry) => {
                        queryParams.set(entry[0], entry[1])
                        return queryParams;
                    }
                    , new URLSearchParams()
                ).toString()}`
        }
        window.history.pushState(restParams || {}, '', url);
        window.dispatchEvent(new Event('popstate'));
    }

    showLoader(){
        this._loader.style.display = 'flex';
    }

    hideLoader(){
        this._loader.style.display = 'none';
    }
}

export { Base };