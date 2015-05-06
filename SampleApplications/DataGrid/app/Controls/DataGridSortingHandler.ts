
module Controls {

	export class DataGridSortingInfo {

		isInverted : boolean = false;
		definition: IDataGridColumnDefinition;

		constructor(definition: IDataGridColumnDefinition) {
			this.definition = definition;
		}
	}

	export class DataGridSortingHandler {

		private _isInternalChange: boolean = false;

		private _sortBy = new Array<DataGridSortingInfo>();
		public get sortBy() : Array<DataGridSortingInfo> {
			return this._sortBy;
		}
		public set sortBy(value: Array<DataGridSortingInfo>) {

			if (value == this._sortBy) return;

			this._sortBy = value;
		}

		public onItemsSourceChanged(itemsSource: KnockoutObservableArray<any>) : void {

			if (this._isInternalChange || this._sortBy.length == 0) return;

			this.performSort(itemsSource);
		}

		public onColumnDefinitionsChanged(
			itemsSource: KnockoutObservableArray<any>,
			columnDefinitions: KnockoutObservableArray<IDataGridColumnDefinition>) : void {

			if (this._sortBy.length == 0) return;

			var newDefs = Ix.Enumerable.fromArray(columnDefinitions());
			var currentSortDefs = Ix.Enumerable.fromArray(this._sortBy);

			var newSortDefs = currentSortDefs
				.join(newDefs, a => a.definition, b => b, (a, b) => a)
				.toArray();

			if (newSortDefs.length == this._sortBy.length) return;

			this._sortBy = newSortDefs;

			this.performSort(itemsSource);
		}

		public trySort(
			itemsSource: KnockoutObservableArray<any>, 
			headerEvent: DataGridHeaderEventArgument) : boolean { 
			
			if (headerEvent.event.srcEvent && headerEvent.event.srcEvent.shiftKey) 
				return this.tryPerformNestedSort(itemsSource, headerEvent);

			return this.tryPerformSingleSort(itemsSource, headerEvent);
		}

		private tryPerformSingleSort(
			itemsSource: KnockoutObservableArray<any>, 
			headerEvent: DataGridHeaderEventArgument) : boolean {

			if (this._sortBy.length > 0 && this._sortBy[0].definition == headerEvent.column)
				this._sortBy[0].isInverted = !(this._sortBy[0].isInverted);
			else
				this._sortBy = [ new DataGridSortingInfo(headerEvent.column) ];

			this.performSort(itemsSource);

			return true;
		}

		private tryPerformNestedSort(
			itemsSource: KnockoutObservableArray<any>, 
			headerEvent: DataGridHeaderEventArgument) : boolean {
			
			var col = headerEvent.column;

			var sortInfo = Ix.Enumerable.fromArray(this._sortBy).firstOrDefault(c => c.definition == col);

			if (sortInfo != null) 
				sortInfo.isInverted = !(sortInfo.isInverted);
			else 
				this._sortBy.push(new DataGridSortingInfo(col));

			this.performSort(itemsSource);

			return false;
		}

		private performSort(itemsSource: KnockoutObservableArray<any>) {

			if (this._sortBy.length == 0) return;

			var sortBy = this._sortBy;
			var sortByLength = sortBy.length;

			this._isInternalChange = true;

			itemsSource.mergeSort(
				(left: any, right: any) => {

					var result = 0;
					var def: IDataGridColumnDefinition = null;

					for (var cIdx = 0 ; result == 0 && (cIdx < sortByLength) ; ++cIdx) {
						
						def = sortBy[cIdx].definition;
						result = (sortBy[cIdx].isInverted ? -1 : 1) * def.compare(def.getSortValue(left), def.getSortValue(right));
					}

					return result;
				});

			this._isInternalChange = false;
		}
	}
}