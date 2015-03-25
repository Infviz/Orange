/// <reference path="../../_references.ts" />


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

		public vmX = ko.observable<number>(0.5);
		public vmY = new Rx.BehaviorSubject<number>(0.5);

		constructor() {
			this.init();
		}

		public init() : void {
			
			Rx.Observable
				.timer(100, 1000)
				.timeInterval()
				.subscribe(
					interval => {
						this.vmX(Math.random());
						this.vmY.onNext(Math.random());
					}, 
					(err) => {}, 
					() => {});
		}
	}
}