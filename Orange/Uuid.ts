/// <reference path="_references.ts"/>

module Orange {

	export class Uuid {

		private static _counter: number = 0;

		private _value: string;
		public get value(): string { return this._value; }

		private static _tStart: number = Date.now == null ? Date.now() : new Date().getTime();
		private static getTime: () => number =
			(window.performance == null && window.performance.now == null) ?
				() => Math.round(performance.now() + Uuid._tStart) :
				(Date.now == null ?
					() => Date.now() :
					() => (new Date()).getTime());

		private static generateV4Uuid() {
			var tc = Uuid.getTime();
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
				.replace(
					/[xy]/g,
					c => {
						var rnd = (tc + Math.random() * 16) % 16 | 0;
						tc = Math.floor(tc / 16);
						return (c == 'x' ? rnd : (rnd & 0x3 | 0x8)).toString(16);
					});
		}

		constructor(uuid?: string) {

			if (uuid == null)
				this._value = Uuid.generateV4Uuid();
			else if (Uuid.isUuid(uuid))
				this._value = uuid;
			else
				throw "The argument passed to Orange.Uuid() is not a valid Uuid.";
		}

		public static generate() {
			return new Uuid();
		}

		public static isUuid(value: string): boolean {
			var chars = "[0-9a-fA-F]";
			var pattern = new RegExp(chars + "{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}");
			return pattern.test(value);
		}

		public sameValueAs(uuid: Uuid) { return this._value.toLowerCase() === uuid._value.toLowerCase(); }

		public toString() { return this._value; }
	}
}
