

/// <reference path="../../../orange.d.ts" />

namespace BasicExample {

    export class MainViewModel {
        header: string = "My main view model";
        content: string = "Some nice content";
    }

    @Orange.Modularity.inject
    export class MainView extends Orange.Controls.KnockoutViewBase {
        constructor(vm: MainViewModel) {
            super('BasicExample-MainView', vm);
        }
    }

    export class Application {

        private container: Orange.Modularity.Container = null;
        private manager: Orange.Controls.ControlManager = null;

        constructor() {
            this.container = new Orange.Modularity.Container();
            this.manager = new Orange.Controls.ControlManager(this.container);

            this.manager.manage(document.body);
        }
    }

    window.onload = () => new Application();
}