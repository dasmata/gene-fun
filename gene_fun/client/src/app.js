import services from './Services/Services.js';
import './Components/loader/Loader.js';

const routes = {
    '/': 'Index',
    '/index.html': 'Index',
    '/board': 'Board'
}

class App {
    _page;
    _layout;
    _pageContent;

    async init() {

        await this.bootstrapRoute(window.location.pathname);

        addEventListener('popstate', () => {
            this.bootstrapRoute(window.history.state.route)
        });

    }

    async bootstrapRoute(route) {
        if (!routes[route]) {
            console.log('404 Not Found!');
        }

        this._page?.destroy?.();

        const Controller = await this._loadController(routes[route]);
        if (this._layout !== Controller.layout) {
            await this.loadLayout(Controller.layout)
        }

        if (this._pageContent !== Controller.partial) {
            await this.loadPageContent(Controller.partial);
        }

        this._page = new Controller(services)
        this._page.init();
    }

    async _loadController(name) {
        try{
            const module = await import(`./controllers/${name}.js`);
            if (module[name]) {
                return module[name];
            }
        } catch (e) { console.log(e) }
        throw new Error(`Could not load controller ${name}`)
    }

    async loadLayout(name) {
        const response = await fetch(`/layouts/${name}.html`);
        if (response.status !== 200) {
            console.error(`Could not find ${name} layout`);
            return;
        }
        document.getElementById('page').innerHTML = await response.text()
        this._layout = name;
    }

    async loadPageContent(name) {
        const response = await fetch(`/partials/${name}.html`);
        if (response.status !== 200) {
            console.error(`Could not load ${name} partial`);
            return;
        }
        document.querySelector('main').innerHTML = await response.text()
        this._pageContent = name;
    }
}


const app = new App();
app.init()