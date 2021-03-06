/// <reference path="../../../../orange.d.ts" />
/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../bower_components/rxjs/ts/rx.all.d.ts" />

module Views.MainContainer {

    export class NestedWithExternalViewModelItem {

        public label: string;
        public color: string;
        constructor(label: string, color: string) {

            this.label = label;
            this.color = color;
        }
    }

    export class MainContainerViewModel {

        public nestedWithExternalViewModelItems: Array<NestedWithExternalViewModelItem>;
        public nestedWithExternalViewModelObservableItems = ko.observableArray<NestedWithExternalViewModelItem>();

        public nestedWithExternalViewModel: NestedWithExternalViewModelItem;
        public nestedWithExternalViewModelObservable = ko.observable<NestedWithExternalViewModelItem>();

        private _itemCounter: number = 0;
        private _itemCreationIntervalHandle: any = null;
        constructor() {
            this.init();
        }

        public init() : void {
            
            this.nestedWithExternalViewModelItems = [
                new NestedWithExternalViewModelItem("One", "rgb(240, 30, 30)"),
                new NestedWithExternalViewModelItem("Two", "rgb(30, 30, 240)"),
                new NestedWithExternalViewModelItem("Three", "rgb(30, 240, 30)")
            ];

            this.nestedWithExternalViewModel = new NestedWithExternalViewModelItem("Amazing!", "rgb(240, 70, 30)");

            this.nestedWithExternalViewModelObservable(new NestedWithExternalViewModelItem("Amazing!", "rgb(240, 70, 30)"));

            // asynchronous view / view model injection. 
            this.createViewItem();
            this._itemCreationIntervalHandle = window.setInterval(this.createViewItem, 2000);
            var _a = window.setInterval(
                () => {
                    window.setInterval(this.deleteItem, 2000);
                    window.clearInterval(_a);

                }, 9000);
        }

        private createViewItem = () => {

            var randGray = () => Math.round(Math.random() * 255);
            var createColor = () => "rgb(" + randGray() + ", " + randGray() + ", " +  randGray() +  ")"
            
            this._itemCounter++;

            var newView = new NestedWithExternalViewModelItem("Item #" + this._itemCounter, createColor());

            this.nestedWithExternalViewModelObservableItems.unshift(newView);

            var content = ["Fantascic!", "This is great!", "Dreamy!", "Yep!"];
            this.nestedWithExternalViewModelObservable(
                new NestedWithExternalViewModelItem(
                    content[Math.round(Math.random() * (content.length - 1))], 
                    createColor()));
        }

        private deleteItem = () => {
            this.nestedWithExternalViewModelObservableItems.pop();
        }
    }
}