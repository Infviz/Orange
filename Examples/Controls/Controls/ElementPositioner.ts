/// <reference path="../../../orange.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />

namespace Controls {
    export class ElementPositioner extends Orange.Controls.TemplatedControl {
        
        private _x : number = 0;
        public get x() : number { return this._x; }
        public set x(v : number) {
            if (this._x == v) return;
            this._x = v;
            this.recreateGraphics();
        }

        private _y : number = 0;
        public get y() : number { return this._y; }
        public set y(v : number) {
            if (this._y == v) return;
            this._y = v;
            this.recreateGraphics();
        }

        private _container: HTMLDivElement = null;
        private _positionedTemplate: HTMLElement = null;
        
        private static _template: string =
            `<div style="display: inline-block; position: relative;" class="element_positioner_container"></div>`;
        
        constructor() {
            super(new Orange.Controls.StringTemplateProvider(ElementPositioner._template));
        }

        private recreateGraphics() : void {

            if (false == this.isTemplateApplied) return;

            let bcr = this._container.getBoundingClientRect();
            let pBcr = this.element.getBoundingClientRect();

            let style = this._container.style;

            style.left = (this.x * 100) + "%";
            style.top = (this.y * 100)  + "%";

            let transform: string = "translateX(-" + (bcr.width * 0.5) + "px) translateY(-" + (bcr.height * 0.5) + "px)";
            (<any>style)["-webkit-transform"] = transform;
            style.transform = transform;
        }

        protected onElementSet() {

            super.onElementSet();
            this._positionedTemplate = <HTMLElement>this.element.removeChild(this.element.firstElementChild);
        }

        protected onApplyTemplate(): void {

            super.onApplyTemplate();

            this._container = <HTMLDivElement>this.element.querySelector(".element_positioner_container");

            let style = this.element.style;

            style.display = "block";
            style.boxSizing = "border-box";
            style.position = "relative"
            style.width = "100%";
            style.height = "100%";

            this._container.appendChild(this._positionedTemplate);

            if (this._positionedTemplate.querySelectorAll("[data-bind]").length > 0 && 
                !ko.dataFor(this._positionedTemplate))
            {
                ko.applyBindings(this._positionedTemplate);
            }

            this.recreateGraphics();
        }
    }
}