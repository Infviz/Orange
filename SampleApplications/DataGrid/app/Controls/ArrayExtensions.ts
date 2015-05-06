
module ArrayExtensions {

	export function mergeSort<T>(
		array: Array<T>, 
		compareFunc?: (a: T, b: T) => number): Array<T> {

		if (array.length < 2) return;

		compareFunc = compareFunc ? compareFunc : (a, b) => a < b ? -1 : (a > b ? 1 : 0);

		var _merge = 
			(left: Array<T>, right: Array<T>) => {

				var result = <Array<T>>[ ];

				while (left.length && right.length)
					result.push(compareFunc(left[0], right[0]) <= 0 ? left.shift() : right.shift());

				if (left.length) result.push.apply(result, left);
				if (right.length) result.push.apply(result, right);

				return result;
			};

		var _mergeSort = 
			(arr: Array<T>) => {

				var mid = ~~(arr.length * 0.5);
				
				if (mid == 0) return arr;

				var left = _mergeSort(arr.slice(0, mid));
				var right = _mergeSort(arr.slice(mid, arr.length));

				return _merge(left, right);
			};

		var result = _mergeSort(array);

		var args = [0, array.length].concat(result);
		Array.prototype.splice.apply(array, args);

		return array;
	}
}

ko.observableArray['fn']['mergeSort'] = 
	function () {
		var underlyingArray = this.peek();
		this.valueWillMutate();
		var methodCallResult = ArrayExtensions.mergeSort(underlyingArray, arguments[0]);
		this.valueHasMutated();
		return methodCallResult;
	};

interface KnockoutObservableArrayFunctions<T> {
	mergeSort(compareFunction?: (left: T, right: T) => number): void;
}