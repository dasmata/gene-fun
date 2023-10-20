import { Base } from "./Base.js";

import '../Components/trainings/TrainingsList.js';

class Index extends Base{
    _views;

    constructor(serviceContainer){
        super(serviceContainer);
        this._views = {
            'trainings': document.querySelector('trainings-list-view'),
            'users': document.querySelector('users-list-view'),
            'loader': document.querySelector('loader-view')
        };
        this._views.trainings.addEventListener('select', e => {
            this.navigate(window.location.pathname, {
                route: '/board',
                training: e.detail
            })
        });
    }

    async init(){
        const trainingService = await this._serviceContainer.get('training');
        const trainings = await trainingService.getAll(this._queryParams.get('page'));
        this.hideLoader();
        this._views.trainings.trainings = trainings;
        this._views.trainings.style.display = 'block';
    }
}

Index.layout = 'main';
Index.partial = 'trainings';

export {
    Index
}