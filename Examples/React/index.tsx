
/// <reference path="../../orange.d.ts" />

export {} ; // force module

window.onload = () => {
    
    let container = new Orange.Modularity.Container();
    let controlManager = new Orange.Controls.ControlManager(container);
    
    container.registerInstance(Orange.Modularity.Container, container);
    container.registerInstance(Orange.Controls.ControlManager, controlManager);
    
    controlManager.manage(document.body); 
}