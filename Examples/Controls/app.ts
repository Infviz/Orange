/// <reference path="../../orange.d.ts" />

let startReq = { windowLoaded: false, templatesLoaded: false };

function tryStartup() {

    if (!startReq.windowLoaded || !startReq.templatesLoaded)
        return;

    let application = new Application();
    application.run();
}

window.onload = () => {
    startReq.windowLoaded = true;
    tryStartup();
};

TemplateLoader.onload = () => {
    startReq.templatesLoaded = true;
    tryStartup();
};

class Application {

    public run(): void {
        
        let container = new Orange.Modularity.Container();
        let controlManager = new Orange.Controls.ControlManager(container);
        
        container.registerInstance(Orange.Modularity.Container, container);
        container.registerInstance(Orange.Controls.ControlManager, controlManager);
        
        controlManager.manage(document.body);
    }
}


