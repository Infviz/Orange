/// <reference path="../../../../orange.d.ts" />
/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../bower_components/rxjs/ts/rx.all.d.ts" />

namespace Views.MainContainer {

	export class MainContainerViewModel {

		public vmX = ko.observable<number>(0.5);
		public vmY = new Rx.BehaviorSubject<number>(0.5);
		public name = ko.observable<string>("I am possitioned!");

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
					});

			this.name.subscribe(val => console.log(val) );
		}
	}
}