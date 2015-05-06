/// <reference path="_references.ts" />

var startReq = { windowLoaded: false, templatesLoaded: false};

function tryStartup() {

    if (!startReq.windowLoaded || !startReq.templatesLoaded)
    	return;

    var application = new Application();
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
		
		var container = new Orange.Modularity.Container();

		var controlManager = new Orange.Controls.ControlManager(container);
        
        container.registerInstance(Orange.Controls.ControlManager, controlManager);
        controlManager.manage(document.body);
	}
}


