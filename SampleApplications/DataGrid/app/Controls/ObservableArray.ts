
module Controls {

	export class ObservableArrayChangedEventArguments<T> {

		// Add 			One or more items were added to the collection.
		// Move			One or more items were moved within the collection.
		// Remove		One or more items were removed from the collection.
		// Replace		One or more items were replaced in the collection.
		// Reset

		constructor() {
			// code...
		}
	}

	export class ObservableArray<T> {

		private _elements: Array<T> = null;

		private _changed = new Rx.Subject<ObservableArrayChangedEventArguments<T>>();
		public get changed() : Rx.Subject<ObservableArrayChangedEventArguments<T>> {
			return this._changed;
		}

		private _bufferChanges : boolean;
		public get bufferChanges() : boolean {
			return this._bufferChanges;
		}
		public set bufferChanges(v : boolean) {
			this._bufferChanges = v;
		}

		constructor();
		constructor(array: Array<T>);
		constructor(enumerable: Ix.Enumerable<T>);
		constructor() {

			var initialArray: Array<T> = null;

			if (arguments.length = 0) {
				initialArray = new Array<T>();
			}
			else if (Array.isArray(arguments[0])) {
				initialArray = <Array<T>>arguments[0];

			} else if (arguments[0] instanceof Ix.Enumerable) {

				initialArray = (<Ix.Enumerable<T>>arguments[0]).toArray();
			}

			if (initialArray == null)
				throw "ObservableArray constructor was passed faulty arguments."

			this._elements = initialArray;
		}

		private raiseChanged() {

		}

		public getElementAt(index: number) : T {
			return this._elements[index];
		}

		public contains(element: T) : boolean {
			return -1 < this._elements.indexOf(element);
		}

		public indexOf(element: T) : number {
			return this._elements.indexOf(element)
		}

		

		public get length() : number {
			return this._elements.length;
		}

		public toArray() : Array<T> {
			return this._elements.slice(0);
		}

		public toEnumerable() : Ix.Enumerable<T> {

			return Ix.Enumerable.fromArray(this._elements);	
		}

		// Altering methods.. 

		public push(element: T): void {

			this._elements.push(element);

			// TODO: Raise change.. 
		}

		public pushRange(elements: Array<T>) : void {
			this._elements.concat(elements);

			// TODO: Raise change.. 
		}

		public setElementAt(index: number, element: T) : void {

			this._elements[index] = element; 

			// TODO: Raise change.. 
		}

		public removeElementAt(index: number) : void {
			
			this._elements.splice(index, 1);

			// TODO: Raise change.. 
		}

		public removeElement(element: T) : void {

			var index = this._elements.indexOf(element);

			if (index > -1)
				this.removeElementAt(index);
		}

		public insert(index: number, element: T) {
			this._elements.splice(index, 0, element);

			// TODO: Raise change.. 
		}

		public move(oldIndex: number, newIndex: number) : void {
			
			this._elements.splice(newIndex, 0, this._elements.splice(oldIndex, 1)[0]);

			// TODO: Raise change.. 
		}

		public clear(): void {
			this._elements = new Array<T>();

			// TODO: Raise change.. 
		}

		public stableSort(compare?: (a: T, b: T) => number) : void {

			if (this._elements.length < 2) return;

			compare = compare ? compare : (a: T, b: T) => a < b ? -1 : (a > b ? 1 : 0);

			var result = ObservableArray.mergeSort(this._elements, compare);
		}

		private static mergeSort<T>(array: Array<T>, compare: (a: T, b: T) => number) {

	        var mid = ~~(array.length * 0.5);
	        var left = this.mergeSort( array.slice(0, mid), compare);
	        var right = this.mergeSort( array.slice(mid, array.length), compare);

	        return this.merge(left, right, compare);
		}

		private static merge<T>(left: Array<T>, right: Array<T>, compare: (a: T, b: T) => number) {

	        var result = [ ];

	        while (left.length && right.length)
	            result.push(compare(left[0], right[0]) <= 0 ? left.shift() : right.shift());

	        if (left.length) result.push.apply(result, left);
	        if (right.length) result.push.apply(result, right);

	        return result;
	    }















	}
}