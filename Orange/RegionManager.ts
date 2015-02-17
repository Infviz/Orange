
/// <reference path="Reference.d.ts"/>

module Orange.Modularity {

    export class RegionManager {
        constructor(public container: Orange.Modularity.Container) { }

        public disposeRegions(root: HTMLElement) {
            var attr = root.getAttribute("data-view");
            if (attr == null || attr == "") {
                if (typeof root.children !== "undefined") {
                    for (var i = 0; i < root.children.length; i++)
                        this.disposeRegions(<HTMLElement>root.children[i]);
                }
            }
            else {
                var view = <any>root["instance"];
		        if (typeof view.dispose === 'function')
                    view.dispose();
            }
        }

        public initializeRegions(root: HTMLElement): void {
            var attr = root.getAttribute("data-view");
            if (attr == null || attr == "") {
                if (typeof root.children !== "undefined") {
                    for (var i = 0; i < root.children.length; i++)
                        this.initializeRegions(<HTMLElement>root.children[i]);
                }
            }
            else {
                var viewType = eval(attr);
                var view = this.container.resolve(viewType);
                if (typeof view.element !== "undefined")
                    view.element = root;

                var idAttr = root.getAttribute("data-view-id");

                if (idAttr != null && attr != "") {
                    if (view.setViewId !== "undefined") {
                        view.setViewId(idAttr);
                    }
                }

                root["instance"] = view;
            }
        }
    }

}