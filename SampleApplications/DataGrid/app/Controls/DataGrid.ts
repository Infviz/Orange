/// <reference path="../_references.ts" />

module Controls {

	export interface IDataGridColumnDefinition {

		width: number;
		getSortValue: (context: any) => any;
		compare: (a: any, b: any) => number;
		
		createCellElement(row: HTMLDivElement, rowContext: any) : HTMLDivElement;
		createHeaderElement(row: HTMLDivElement, rowContext: any) : HTMLDivElement;
	}

	export class RenderFrame {

        private static _observable: Rx.Observable<any>;

        public static getObservable() {

            if (RenderFrame._observable == null) {

                var s = Rx
                    .Observable
                    .generate(0,
                        x => true,
                        x => x + 1,
                        x => x,
                    <Rx.IScheduler>((<any>Rx.Scheduler).requestAnimationFrame))
                    .publish();

                RenderFrame._observable = s;

                s.connect();
            }

            return RenderFrame._observable;
        }
    }

	export class DataGrid extends Orange.Controls.TemplatedControl {
		
		private _itemsSourceDisposable: KnockoutSubscription = null;
		private _itemsSource : KnockoutObservableArray<any> = null;
		public get itemsSource() : KnockoutObservableArray<any> {
			return this._itemsSource;
		}
		public set itemsSource(v : KnockoutObservableArray<any>) {

			if (v == this._itemsSource) return;

			if (this._itemsSourceDisposable != null) 
			{
				this._itemsSourceDisposable.dispose();
				this._itemsSourceDisposable = null;
			}

			this._itemsSource = v;

			this._itemsSource
				.extend({ 
					rateLimit: { 
						timeout: 50, 
						method: "notifyWhenChangesStop" 
					} 
				});

			this._itemsSourceDisposable = this._itemsSource
				.subscribe(this.itemsSourceChanged, null, "arrayChange");

			this.recreateTable();
		}

		private _headerContext : any = null;
		public get headerContext() : any {
			return this._headerContext;
		}
		public set headerContext(v : any) {

			if (v == this._headerContext) return;

			this._headerContext = v;

			this.recreateHeader();
		}

		private _columnDefinitions : Array<IDataGridColumnDefinition> = null;
		public get columnDefinitions() : Array<IDataGridColumnDefinition> {
			return this._columnDefinitions;
		}
		public set columnDefinitions(v : Array<IDataGridColumnDefinition>) {
			this._columnDefinitions = v;

			this.recreateTable();
		}

		private _frozenColumnCount : number = 0;
		public get frozenColumnCount() : number {
			return this._frozenColumnCount;
		}
		public set frozenColumnCount(v : number) {

			this._frozenColumnCount = v ? v : 0;
			this.recreateTable();
		}

		private _selectionHandler : IDataGridSelectionHandler = null;
		private _selectionHandlerChangeDisposable: Rx.IDisposable = null;
		public get selectionHandler() : IDataGridSelectionHandler {
			return this._selectionHandler;
		}
		public set selectionHandler(v : IDataGridSelectionHandler) {

			if (this._selectionHandler == v) return;

			if (this._selectionHandler)
				this._selectionHandler.clearSelection();

			this._selectionHandler = v;

			if (this._selectionHandlerChangeDisposable)
				this._selectionHandlerChangeDisposable.dispose();

			this._selectionHandlerChangeDisposable = 
				this._selectionHandler.selectionChanged
					.subscribe(this.onSelectionChanged);
		}

		private _sortingHandler : DataGridSortingHandler = null;
		public get sortingHandler() : DataGridSortingHandler {
			return this._sortingHandler;
		}
		public set sortingHandler(v : DataGridSortingHandler) {

			if (this._sortingHandler == v) return;

			this._sortingHandler = v;

			this._sortingHandler.onItemsSourceChanged(this.itemsSource);
		}	

		public onClicked = new Rx.Subject<DataGridRowEventArgument>();
    	public onDoubleClicked = new Rx.Subject<DataGridRowEventArgument>();

		private static _template: string = 
			'<div class="data_grid" data-bind="stopBindings: true">' +
			'	<div class="dg_body_container">' +
			'		<div class="dg_rows dg_header">' +
			'		</div>' + 
			'		<div class="dg_body dg_frozen">' +
			'		</div>' + 
			'		<div class="dg_body">' +
			'		</div>' + 
			'	</div>' + 
			'	<div class="dg_header_container">' +
			'	</div>' + 
			'	<div class="dg_header_container dg_frozen">' +
			'	</div>' + 
			'</div>';

		private _body: HTMLDivElement = null;
		private _frozenColumns: HTMLDivElement = null;
		private _frozenHeader: HTMLDivElement = null;
		private _bodyHeader: HTMLDivElement = null;
		private _frozenHeaderColumns: HTMLDivElement = null;

		private _renderFrameDisposable: Rx.IDisposable = null;

		private _rowIdToElementDictionary: { [id: string] : IDataGridRow; } = { };
		private _rows: Array<IDataGridRow> = new Array();

		private _header : DataGridHeader = null;

		private _calculateDistributedColumns = false;

		constructor() {
			super(new Orange.Controls.StringTemplateProvider(DataGrid._template));

			this.selectionHandler = new DataGridSingleSelectSelectionHandler();
			this.sortingHandler = new DataGridSortingHandler();

			this.onClicked.subscribe(
				evt => this.selectionHandler.trySelect(this.itemsSource, evt));
		}

		private _uIdCounter: number = 0;
		private createUId() : string {
			return "o-dg-id-" + this._uIdCounter++;
		}

		protected onElementSet() {

			super.onElementSet();

			this.initScrollEventListeners();

			if (this.element.getAttribute("data-grid-column-width") == "distributed")
				this._calculateDistributedColumns = true;
		}

		protected onApplyTemplate(): void {

			super.onApplyTemplate();

			var el = this.element;

			this._body = <HTMLDivElement>el.querySelector("div.data_grid .dg_body_container .dg_body:not(.dg_frozen)");
			this._frozenColumns = <HTMLDivElement>el.querySelector("div.data_grid .dg_body_container .dg_body.dg_frozen");
			this._frozenHeader = <HTMLDivElement>el.querySelector("div.data_grid .dg_header_container:not(.dg_frozen)");
			this._bodyHeader = <HTMLDivElement>el.querySelector("div.data_grid .dg_body_container .dg_rows.dg_header");
			this._frozenHeaderColumns = <HTMLDivElement>el.querySelector("div.data_grid .dg_header_container.dg_frozen");

			this._renderFrameDisposable = RenderFrame
				.getObservable()
				.subscribe(ts => this.onRenderFrame(ts));
		}

		protected onApplyBindings(): void {

		}

		private _isUpdatePositionsRequested: boolean = false;
		private onRenderFrame(ts: any) : void {

			if (this._isDisposing)
				return;

			if (this._isUpdatePositionsRequested) {

				this._isUpdatePositionsRequested = false;	
				this.updatePositions();
			}
		}

		private onSelectionChanged = (change: {newSelection: Array<any>; oldSelection: Array<any>;}) : void =>  {

			var newSelection = Ix.Enumerable.fromArray(change.newSelection);
			var oldSelection = Ix.Enumerable.fromArray(change.oldSelection);

			var toSelect = newSelection.except(oldSelection).toArray();
			var toDeSelect = oldSelection.except(newSelection).toArray();

			if (toSelect.length == 0 && 
				toDeSelect.length == 0 && 
				(newSelection.any() || oldSelection.any()))
			{
				toSelect = toDeSelect = newSelection.toArray();
			}

			var rows = Ix.Enumerable.fromArray(this._rows);

			for (var i = 0; i < toDeSelect.length; ++i) {
				
				var item = toDeSelect[i];

				var row = rows.firstOrDefault(r => r.context == item);
				
				if (row == null)
					continue;

				$(row.getElement()).removeClass("selected");
				$(row.getFrozenElement()).removeClass("selected");
			}

			for (var i = 0; i < toSelect.length; ++i) {

				var item = toSelect[i];

				var row = rows.firstOrDefault(r => r.context == item);
				
				if (row == null)
					continue;

				$(row.getElement()).addClass("selected");
				$(row.getFrozenElement()).addClass("selected");
			}
		}

		private initScrollEventListeners() : void {

			window.addEventListener("scroll", this.onScroll, true);
			window.addEventListener("resize", this.onScroll, true);
		}

		private _isDisposing: boolean = false;
		public dispose() : void {
			this._isDisposing = true;
			super.dispose();

			window.removeEventListener("scroll", this.onScroll, true);
			window.removeEventListener("resize", this.onScroll, true);

			if (this._itemsSourceDisposable != null) 
			{
				this._itemsSourceDisposable.dispose();
				this._itemsSourceDisposable = null;
			}

			this._renderFrameDisposable.dispose();
		}

		private onScroll = (args: Event) : void => {

			this._isUpdatePositionsRequested = true;
		}

		private updatePositions() : void {
			
			this._isUpdatePositionsRequested = false;
				
			var elbb = this.element.getBoundingClientRect();
			var brbb = this._body.getBoundingClientRect();
			var fhbb = this._frozenHeader.getBoundingClientRect();
			var fcbb = this._frozenColumns.getBoundingClientRect();
			
			var diff = elbb.left + fhbb.left - brbb.left;

			this._frozenHeader.style.left = fhbb.left - diff + "px";
			this._frozenColumns.style.left = elbb.left - brbb.left + "px";
		}

		private itemsSourceChanged = () => {

			console.log("ItemsSourceChanged");
			
			var newRows = new Array<IDataGridRow>();

			var rowDict = Ix.Enumerable.fromArray(this._rows).toDictionary(r => r.context, r => r);

			var bRows = <HTMLDivElement>this._body.firstElementChild.parentNode.removeChild(this._body.firstElementChild);
			var fRows = <HTMLDivElement>this._frozenColumns.firstElementChild.parentNode.removeChild(this._frozenColumns.firstElementChild);
			
			bRows.innerHTML = "";
			fRows.innerHTML = "";
			
			var items = this._itemsSource();

			for (var itemIdx = 0; itemIdx < items.length; ++itemIdx) {
				
				var item = items[itemIdx];

				var row = rowDict.tryGetValue(item);
				if (!row) {

					row = new DataGridRow(
						item, 
						this.createUId(), 
						this.columnDefinitions, 
						this.frozenColumnCount, 
						this._calculateDistributedColumns);
				}

				newRows.push(row);

				bRows.appendChild(row.getElement());
				
				if (this.frozenColumnCount > 0)
					fRows.appendChild(row.getFrozenElement());
			}

			this._body.appendChild(bRows);
			this._frozenColumns.appendChild(fRows);

			// var currRows = this._rows;
			// var rowEls = <HTMLDivElement>this._body.firstElementChild.parentNode.removeChild(this._body.firstElementChild);
			// var frozenRowEls = <HTMLDivElement>this._frozenColumns.firstElementChild.parentNode.removeChild(this._frozenColumns.firstElementChild);

			// var rowElCache = new Array<IDataGridRow>();

			// var indexOffset = 0;

			// for (var changeIdx = 0 ; changeIdx < changes.length ; changeIdx++) {

			// 	var change = changes[changeIdx];

			// 	var status = change.status;
			// 	var isPartOfMove = !!(change.moved);

			// 	if (status === "added") {

			// 		if (false == isPartOfMove) {
			// 			this.addRow(change.value, rowEls, frozenRowEls, change.index);
			// 		}
			// 		else {
						
			// 			var row = Ix.Enumerable
			// 				.fromArray(rowElCache)
			// 				.firstOrDefault(r => r.context == change.value);

			// 			if (row == null) {
			// 				row = this.removeRow(rowEls, frozenRowEls, change.moved + indexOffset);

			// 				rowEls.insertBefore(
			// 					document.createElement("div"), 
			// 					rowEls.children[change.moved + indexOffset]);

			// 				frozenRowEls.insertBefore(
			// 					document.createElement("div"), 
			// 					frozenRowEls.children[change.moved + indexOffset]);
			// 			}

			// 			if (!row)
			// 				throw "Should not be possible!";

			// 			rowEls.insertBefore(
			// 				row.getElement(), 
			// 				rowEls.children[change.index]);

			// 			frozenRowEls.insertBefore(
			// 				row.getFrozenElement(), 
			// 				frozenRowEls.children[change.index]);

			// 			this._rows.push(row);
			// 			this._rowIdToElementDictionary[row.id] = row;
			// 		}
					
			// 		indexOffset++;

			// 	} else if (status === "deleted") {
					
			// 		var row = this.removeRow(rowEls, frozenRowEls, change.index);

			// 		if (isPartOfMove && row)
			// 			rowElCache.push(row);

			// 		indexOffset--;
			// 	}

			// }

			// this._body.appendChild(rowEls);
			// this._frozenColumns.appendChild(frozenRowEls);

			//this.recreateTable();
			console.log("ItemsSourceChanged.. done.");

			this.selectionHandler.onItemsSourceChanged(this.itemsSource);
			this.sortingHandler.onItemsSourceChanged(this.itemsSource);
			this.updateSortDomState();
		}

		private removeRow(
			rowContainer: HTMLDivElement, 
			frozenRowContainer: HTMLDivElement,
			index: number) : IDataGridRow {

			var c = rowContainer.children[index];
			rowContainer.removeChild(c);

			var fc = frozenRowContainer.children[index];
			frozenRowContainer.removeChild(fc);
			
			var id = c.getAttribute("data-dg-row-id");

			if (!id) return;

			var row = this._rowIdToElementDictionary[id];
			delete this._rowIdToElementDictionary[id];
			return this._rows.splice(this._rows.indexOf(row), 1)[0];
		}

		private addRow(
			context: any, 
			rowContainer: HTMLDivElement, 
			frozenRowContainer: HTMLDivElement,
			index?: number) {

			var row = new DataGridRow(
				context, 
				this.createUId(), 
				this.columnDefinitions, 
				this.frozenColumnCount, 
				this._calculateDistributedColumns);

			this._rowIdToElementDictionary[row.id] = row;

			var rows = rowContainer;

			if (<any>index == "undefined" || index == null) 
				rows.appendChild(row.getElement());
			else 
				rows.insertBefore(row.getElement(), rows.children[index]);

			if (this.frozenColumnCount > 0) {

				var frozenRows = frozenRowContainer;

				if (<any>index == "undefined" || index == null || index >= frozenRows.children.length) 
					frozenRows.appendChild(row.getFrozenElement());
				else
					frozenRows.insertBefore(row.getFrozenElement(), frozenRows.children[index]);
			}

			this._rows.push(row);

			row.onClicked.subscribe(this.onClicked);
			row.onDoubleClicked.subscribe(this.onDoubleClicked);
		}

		private recreateHeader() : void {

			if (this._header != null) {
				this._header.dispose();
				this._header = null;
			}

			this._frozenHeader.innerHTML = "";
			this._bodyHeader.innerHTML = "";
			this._frozenHeaderColumns.innerHTML = "";

			if (!this._columnDefinitions) return;

			this._header = new DataGridHeader(
				this._headerContext, 
				"dg_header", 
				this._columnDefinitions,
				this.frozenColumnCount,
				this._calculateDistributedColumns);

			var mainHeaderElement = this._header.getElement();
			var frozenHeaderElement = this._header.getFrozenElement();

			this._frozenHeader.appendChild(mainHeaderElement);
			this._bodyHeader.innerHTML = this._frozenHeader.innerHTML;
			this._frozenHeaderColumns.appendChild(frozenHeaderElement);

			this._header.onClicked.subscribe(e => {

					if (false == this._sortingHandler.trySort(this.itemsSource, e))
						return;

					this.updateSortDomState();
				});

			//this._header.onDoubleClicked.subscribe( ... );
		}

		private updateSortDomState() {

			var header = this._header;

			var hEl = header.getElement();
			$(hEl).find(".sort_by").removeClass("sort_by");
			$(hEl).find(".invert_sort").removeClass("invert_sort");

			var fhEl = header.getFrozenElement();
			$(fhEl).find(".sort_by").removeClass("sort_by");
			$(fhEl).find(".inverted_sort").removeClass("inverted_sort");

			var sortOrder = this._sortingHandler.sortBy;

			var allDefs = Ix.Enumerable.fromArray(this._columnDefinitions).select((def, dIdx) => { return {definition: def, index: dIdx} });

			var activeDefs = Ix.Enumerable.fromArray(this._sortingHandler.sortBy)
				.join(allDefs, a => a.definition, b => b.definition, (a, b) => { return { isInverted: a.isInverted, index: b.index }; })

			activeDefs.forEach(
				item => {

					var el = <HTMLDivElement>header.getElement().firstChild.childNodes[item.index];

					$(el).addClass("sort_by");

					if (item.isInverted) 
						$(el).addClass("inverted_sort");

					if (item.index < this._frozenColumnCount) {

						var fEl = <HTMLDivElement>header.getFrozenElement().firstChild.childNodes[item.index];

						$(fEl).addClass("sort_by");

						if (item.isInverted) 
							$(fEl).addClass("inverted_sort");									
					}
				});
		}

		private disposeIdToElementDictionary() : void {

			for (var key in this._rowIdToElementDictionary) {
			    this._rowIdToElementDictionary[key].dispose();
			}

			this._rowIdToElementDictionary = { };
		}

		private recreateTable() : void {

			this._body.innerHTML = "";
			this._frozenColumns.innerHTML = "";
			this._rows = new Array<IDataGridRow>();

			this.recreateHeader();

			if (!this._columnDefinitions || !this._itemsSource)
				return;

			var rows = document.createElement("div");
			rows.className = "dg_rows";
			
			var items = this._itemsSource();

			var frozenRows = document.createElement("div");
			frozenRows.className = "dg_rows dg_frozen";
			
			for (var rIdx = 0; rIdx < items.length; ++rIdx) {

				this.addRow(items[rIdx], rows, frozenRows);
			}

			this._body.appendChild(rows);
			this._frozenColumns.appendChild(frozenRows);
		}
	}
}








