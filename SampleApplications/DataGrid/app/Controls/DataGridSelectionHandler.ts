
module Controls {
	
	export interface IDataGridSelectionHandler {

		selectedItems : Array<any>;
		
		trySelect(itemsSource: KnockoutObservableArray<any>, rowEvent: DataGridRowEventArgument) : boolean;
		onItemsSourceChanged(itemsSource: KnockoutObservableArray<any>): void;
		clearSelection() : void;

		selectionChanged: Rx.Subject<{newSelection: Array<any>; oldSelection: Array<any>;}>;
	}

	export class DataGridSelectionHandlerBase implements IDataGridSelectionHandler {

		protected _selectedItems = new Array<any>();
		public get selectedItems() : Array<any> {
			return this._selectedItems;
		}

		public selectionChanged = new Rx.Subject<{newSelection: Array<any>; oldSelection: Array<any>;}>();

		public trySelect(itemsSource: KnockoutObservableArray<any>, rowEvent: DataGridRowEventArgument) : boolean { 
			throw "An attempt was made to call an abstract method."; 
		}

		public onItemsSourceChanged(itemsSource: KnockoutObservableArray<any>): void { 
			throw "An attempt was made to call an abstract method.";	
		}

		public clearSelection() : void {
			var oldSelection = this._selectedItems.slice();
			this._selectedItems = new Array<any>();
			this.raiseSelectionChanged(this._selectedItems, oldSelection);
		}

		protected raiseSelectionChanged(newSelection: Array<any>, oldSelection: Array<any>) : void {

			if (this.selectionChanged.hasObservers())
				this.selectionChanged.onNext({newSelection: newSelection, oldSelection: oldSelection});
		}
	}

	export class DataGridSelectionDisabledSelectionHandler implements IDataGridSelectionHandler {

		selectedItems = Array<any>();
		
		trySelect(
			itemsSource: KnockoutObservableArray<any>, 
			rowEvent: DataGridRowEventArgument) : boolean { 
			
			return false;
		}

		onItemsSourceChanged(itemsSource: KnockoutObservableArray<any>): void { }
		clearSelection() : void { }

		selectionChanged = new  Rx.Subject<{newSelection: Array<any>; oldSelection: Array<any>;}>();
	}

	export class DataGridSingleSelectSelectionHandler extends DataGridSelectionHandlerBase {

		public trySelect(itemsSource: KnockoutObservableArray<any>, rowEvent: DataGridRowEventArgument) : boolean {
			
			if (itemsSource.indexOf(rowEvent.row.context) < 0)
				return false;

			var oldSelection = this._selectedItems.slice();

			this._selectedItems = [rowEvent.row.context];

			this.raiseSelectionChanged(this._selectedItems, oldSelection);

			return true;
		}

		public onItemsSourceChanged(itemsSource: KnockoutObservableArray<any>): void { 

			if (this._selectedItems.length == 0)
				return;

			var selectedItem = this._selectedItems[0];
			var itemIdx = itemsSource().indexOf(selectedItem);
			
			if (itemIdx > -1)
				this.raiseSelectionChanged(this._selectedItems, this._selectedItems);
			else
				this.clearSelection();
		}
	}

	export class DataGridMultiSelectSelectionHandler extends DataGridSelectionHandlerBase {

		private _multiSelectFocus : any = null;

		public trySelect(itemsSource: KnockoutObservableArray<any>, rowEvent: DataGridRowEventArgument) : boolean {

			if (rowEvent.event.srcEvent && rowEvent.event.srcEvent.shiftKey)
				return this.performSelectRange(itemsSource, rowEvent);

			if (rowEvent.event.srcEvent && (rowEvent.event.srcEvent.metaKey || rowEvent.event.srcEvent.ctrlKey))
				return this.performAdditiveSelect(itemsSource, rowEvent);
			
			return this.performSingleSelect(itemsSource, rowEvent);
		}

		public onItemsSourceChanged(itemsSource: KnockoutObservableArray<any>): void { 
			
			var newSelection = Ix.Enumerable
				.fromArray(this._selectedItems)
				.join(Ix.Enumerable.fromArray(itemsSource()), a => a, b => b, (a, b) => a)
				.toArray();
			
			var oldSelection = this._selectedItems.slice();
			this._selectedItems = newSelection;
			this.raiseSelectionChanged(this._selectedItems, oldSelection);
		}

		protected performSelectRange(itemsSource: KnockoutObservableArray<any>, rowEvent: DataGridRowEventArgument) : boolean {

			if (itemsSource.indexOf(rowEvent.row.context) < 0)
				return false;

			if (this._multiSelectFocus == null)
				return this.performSingleSelect(itemsSource, rowEvent);

			var from = this._multiSelectFocus;
			var to = rowEvent.row.context;

			var fromIdx = itemsSource.indexOf(from);
			var toIdx = itemsSource.indexOf(to);

			if (fromIdx < 0 || toIdx < 0)
				return false;

			if (fromIdx > toIdx) {
				var tmpIdx = fromIdx;
				fromIdx = toIdx;
				toIdx = tmpIdx;
			}

			var newSelection = new Array<any>();
			var ds = itemsSource();

			for (var idx = fromIdx; idx < toIdx + 1; ++idx) {
				newSelection.push(ds[idx]);
			}
			
			var oldSelection = this._selectedItems.slice();
			this._selectedItems = newSelection;
			this.raiseSelectionChanged(this._selectedItems, oldSelection);

			return true;
		}

		protected performAdditiveSelect(itemsSource: KnockoutObservableArray<any>, rowEvent: DataGridRowEventArgument) : boolean {

			if (itemsSource.indexOf(rowEvent.row.context) < 0)
				return false;

			var context = rowEvent.row.context;

			var oldSelection = this._selectedItems.slice();

			// If already selected, deselect the item...
			if (this._selectedItems.indexOf(context) > -1) {
				this._selectedItems.splice(this._selectedItems.indexOf(context), 1);
			}
			// ...else select it
			else {
				this._multiSelectFocus = context;
				this._selectedItems.push(context);
			}

			this.raiseSelectionChanged(this._selectedItems, oldSelection);

			return true;
		}

		protected performSingleSelect(itemsSource: KnockoutObservableArray<any>, rowEvent: DataGridRowEventArgument) : boolean {

			if (itemsSource.indexOf(rowEvent.row.context) < 0)
				return false;

			var oldSelection = this._selectedItems.slice();

			this._selectedItems = [rowEvent.row.context];
			this._multiSelectFocus = rowEvent.row.context;

			this.raiseSelectionChanged(this._selectedItems, oldSelection);

			return true;
		}
	}
}