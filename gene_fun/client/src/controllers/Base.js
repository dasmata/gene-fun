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
        window.history.pushState(params || {}, '', `${page}`);
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