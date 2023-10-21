import { Base } from "./Base.js";

import '../Components/trainings/TrainingsList.js';

class Index extends Base{
    _views;
    _trainings;

    constructor(serviceContainer){
        super(serviceContainer);
        this._views = {
            'trainings': document.querySelector('trainings-list-view'),
            'users': document.querySelector('users-list-view'),
            'loader': document.querySelector('loader-view'),
            'newTraining': document.querySelector('new-training-form-view')
        };
        this.handleSelect = this.handleSelect.bind(this);
        this.handleCreateClick = this.handleCreateClick.bind(this);
        this.handleCreateSubmit = this.handleCreateSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

        this._views.trainings.addEventListener('select', this.handleSelect);
        this._views.trainings.addEventListener('delete', this.handleDelete);
        this._views.trainings.addEventListener('createClick', this.handleCreateClick);
        this._views.newTraining.addEventListener('create', this.handleCreateSubmit);
    }

    destroy(){
        this._views.trainings.removeEventListener('select', this.handleSelect);
        this._views.trainings.removeEventListener('delete', this.handleDelete);
        this._views.trainings.removeEventListener('createClick', this.handleCreateClick);
        this._views.newTraining.removeEventListener('create', this.handleCreateSubmit);
    }

    async handleDelete(e){
        try {
            const service = await this._serviceContainer.get('training');
            await service.remove(e.detail);

            this._trainings = this._trainings.filter(t => t.id !== e.detail);
            this._views.trainings.trainings = this._trainings;
        } catch (e) {
            alert('could not delete training');
        }

    }

    handleSelect(e) {
        this.navigateToTraining(e.detail);
    }

    handleCreateClick() {
        this._views.newTraining.show();
    }

    async handleCreateSubmit(e) {
        const name = e.detail;
        if (name === '') {
            console.error('invalid training name');
            return;
        }
        const trainingService = await this._serviceContainer.get('training');
        try {
            const training = await trainingService.create(name)
            this.navigateToTraining(training);
        } catch (e) {
            console.log('Could not create the training', e);
        }

    }

    navigateToTraining(training) {
        this.navigate(window.location.pathname, {
            route: '/board',
            training: training
        });
    }

    async init(){
        const trainingService = await this._serviceContainer.get('training');
        this._trainings = await trainingService.getAll(this._queryParams.get('page'));
        this.hideLoader();
        this._views.trainings.trainings = this._trainings;
        this._views.trainings.style.display = 'block';
    }
}

Index.layout = 'main';
Index.partial = 'trainings';

export {
    Index
}