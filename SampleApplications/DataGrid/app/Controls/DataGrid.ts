/// <reference path="../_references.ts" />

module Controls {

	export interface IDataGridColumnDefinition {

		width: number;
		sortProperty: string;
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

    export class DataGridHeader {

    	private _hammer: HammerManager = null;
    	private _element: HTMLDivElement = null;
    	private _columnDefinitions: Array<IDataGridColumnDefinition> = null;

    	private _context: any = null;
    	public get context() : any {
    		return this._context;
    	}

    	private _dgContainer: HTMLDivElement = null;
		private _calculateDistributedColumns = false;
		private _frozenColumnCount: number = 0;

    	constructor(
    		context: any, 
    		columnDefinitions: Array<IDataGridColumnDefinition>,
    		dataGridElement: HTMLDivElement,
    		frozenColumnCount: number,
    		calculateDistributedColumns: boolean) {
    		
    		this._context = context;
    		this._columnDefinitions = columnDefinitions;
    		this._dgContainer = dataGridElement;
    		this._calculateDistributedColumns = calculateDistributedColumns;
    		this._frozenColumnCount = frozenColumnCount;
    	}

    	updateHeader() : void {

    		var bodyHeader = <HTMLDivElement>this._dgContainer.querySelector("div.data_grid .dg_body_container .dg_rows.dg_header");
			var frozenHeader = <HTMLDivElement>this._dgContainer.querySelector("div.data_grid .dg_header_container:not(.dg_frozen)");
			var frozenHeaderColumns = <HTMLDivElement>this._dgContainer.querySelector("div.data_grid .dg_header_container.dg_frozen");

			bodyHeader.innerHTML = "";
			frozenHeader.innerHTML = "";
			frozenHeaderColumns.innerHTML = "";

			if (!this._columnDefinitions)
				return;

			var headerEl = document.createElement("div");
			headerEl.className = "dg_rows dg_header";
			
			var rowEl = document.createElement("div");
			rowEl.className = "dg_row";
			headerEl.appendChild(rowEl);

			var frozenHeaderColsEl = document.createElement("div");
			frozenHeaderColsEl.className = "dg_rows dg_header";
			
			var frozenHeaderColsRowEl = document.createElement("div");
			frozenHeaderColsRowEl.className = "dg_row";
			frozenHeaderColsEl.appendChild(frozenHeaderColsRowEl);

			for (var cIdx = 0; cIdx < this._columnDefinitions.length; ++cIdx) {
				
				var colItem = this._columnDefinitions[cIdx];

				var cellEl = colItem.createHeaderElement(rowEl, this._context);

				if (this._calculateDistributedColumns)
				{
					cellEl.style.minWidth = colItem.width + "px";
					cellEl.style.width = (100.0 / this._columnDefinitions.length) + "%";
				}
				else
				{
					cellEl.style.width = colItem.width + "px";
				}

				if (cIdx < this._frozenColumnCount)
				{
					var frozenCellEl = colItem.createHeaderElement(frozenHeaderColsRowEl, this._context);

					if (this._calculateDistributedColumns)
					{
						frozenCellEl.style.minWidth = colItem.width + "px";
						frozenCellEl.style.width = (100.0 / this._columnDefinitions.length) + "%";
					}
					else
					{
						frozenCellEl.style.width = colItem.width + "px";
					}
				}				
			}

			bodyHeader.appendChild(headerEl);
			frozenHeader.innerHTML = bodyHeader.innerHTML;
			frozenHeaderColumns.appendChild(frozenHeaderColsEl);
    	}

    	public dispose() : void {

    		var bodyHeader = <HTMLDivElement>this._dgContainer.querySelector("div.data_grid .dg_body_container .dg_rows.dg_header");
			var frozenHeader = <HTMLDivElement>this._dgContainer.querySelector("div.data_grid .dg_header_container:not(.dg_frozen)");
			var frozenHeaderColumns = <HTMLDivElement>this._dgContainer.querySelector("div.data_grid .dg_header_container.dg_frozen");

    		bodyHeader.innerHTML = "";
			frozenHeader.innerHTML = "";
			frozenHeaderColumns.innerHTML = "";
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

			this._itemsSourceDisposable = this._itemsSource
				.subscribe<Array<KnockoutArrayChange<any>>>(this.itemsSourceChanged, null, "arrayChange");

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

		private _hammer: HammerManager = null;

		private _renderFrameDisposable: Rx.IDisposable = null;

		private _rowIdToElementDictionary: { [id: string] : DataGridRow; } = { };

		private _header : DataGridHeader = null;

		private _calculateDistributedColumns = false;

		constructor() {
			super(new Orange.Controls.StringTemplateProvider(DataGrid._template));
		}

		private _uIdCounter: number = 0;
		private createUId() : string {
			return "o-dg-id-" + this._uIdCounter++;
		}

		protected onElementSet() {

			super.onElementSet();

			this._hammer = new Hammer(this.element);

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

		private initScrollEventListeners() : void {

			window.addEventListener("scroll", this.onScroll, true);
			this._hammer.destroy();
		}

		private _isDisposing: boolean = false;
		public dispose() : void {
			this._isDisposing = true;
			super.dispose();

			window.removeEventListener("scroll", this.onScroll, true);

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

		private itemsSourceChanged = (changes: Array<KnockoutArrayChange<any>>) => {
			
			//console.log(changes);
			this.recreateTable();


			// var comparer = (a: any, b: any) => a === b;

			// var rowCache = new Array<DataGridRow>();
			// var rowCacheEnum = Ix.Enumerable.fromArray(rowCache);

			// var addRow = 
			// 	(context: any, index?: number) =>  {

			// 		var row = rowCacheEnum.firstOrDefault(row => row.context === context);

			// 		if (row == null) {
			// 			row = new DataGridRow(context, this.createUId(), this._columnDefinitions);
			// 			this._rowIdToElementDictionary[row.id] = row;
			// 		}

			// 		var rows = <HTMLDivElement>this._body.firstElementChild;

			// 		if (<any>index == "undefined" || index == null) {
			// 			rows.appendChild(row.getElement());
			// 		}
			// 		else {
			// 			rows.insertBefore(row.getElement(), rows.children[index]);
			// 		}
			// 	};

			// var removeRow = 
			// 	(index: number)  => {
			
			// 		var rows = <HTMLDivElement>this._body.firstElementChild;

			// 		var el = rows.children[index];

			// 		var id = el.getAttribute("data-dg-row-id");
			// 		rowCache.push(this._rowIdToElementDictionary[id]);

			// 		rows.removeChild(el);
			// 	};

			// var indexOffset = 0;
			// changes.forEach((change) => {

			// 		if (change.status == "added") {
			// 			addRow(change.value, change.index + indexOffset);
			// 			indexOffset++;
			// 		}
			// 		else if (change.status == "deleted") {
			// 			removeRow(change.index + indexOffset);
			// 			//indexOffset--;
			// 		}
			// 	});


			// rowCacheEnum
			// 	.select(row => {
			// 			var id = row.getElement().getAttribute("data-dg-row-id");
			// 			delete this._rowIdToElementDictionary[id];
			// 		});
		}

		// private moveRow(from: number, to: number) {

		// 	var rows = <HTMLDivElement>this._body.firstElementChild;

		// 	if (from < to) {

		// 		if (rows.children.length >  to + 1) {
		// 			rows.insertBefore(rows.children[from], rows.children[to + 1]);
		// 		} 
		// 		else {
		// 			rows.appendChild(rows.children[from]);
		// 		}
		// 	}
		// 	else {
				
		// 		rows.insertBefore(rows.children[from], rows.children[to]);
		// 	}
		// }

		private addRow(context: any, index?: number) {

			var row = new DataGridRow(
				context, 
				this.createUId(), 
				this.columnDefinitions, 
				this.frozenColumnCount, 
				this._calculateDistributedColumns);

			this._rowIdToElementDictionary[row.id] = row;

			var rows = <HTMLDivElement>this._body.firstElementChild;

			if (<any>index == "undefined" || index == null) {
				rows.appendChild(row.getElement());
			}
			else {
				rows.insertBefore(row.getElement(), rows.children[index]);
			}

			if (this.frozenColumnCount > 0) {

				var frozenRows = <HTMLDivElement>this._frozenColumns.firstElementChild;

				if (<any>index == "undefined" || index == null) {
					var fr = row.getFrozenElement();
					frozenRows.appendChild(fr);
				}
				else {
					frozenRows.insertBefore(row.getFrozenElement(), rows.children[index]);
				}
			}
		}

		private recreateHeader() : void {

			if (this._header != null) {
				this._header.dispose();
				this._header = null;
			}

			this._header = new DataGridHeader(
				this._headerContext, 
				this._columnDefinitions, 
				<HTMLDivElement>this.element, 
				this.frozenColumnCount,
				this._calculateDistributedColumns);

			this._header.updateHeader();
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

			this.recreateHeader();

			if (!this._columnDefinitions || !this._itemsSource)
				return;

			var rows = document.createElement("div");
			rows.className = "dg_rows";
			this._body.appendChild(rows);

			var items = this._itemsSource();

			if (this.frozenColumnCount > 0)
			{
				var frozenRows = document.createElement("div");
				frozenRows.className = "dg_rows dg_frozen";
				
				this._frozenColumns.appendChild(frozenRows);

				for (var rIdx = 0; rIdx < items.length; ++rIdx) {

					this.addRow(items[rIdx]);
				}
			}
			else {
				for (var rIdx = 0; rIdx < items.length; ++rIdx) {
				
					this.addRow(items[rIdx]);
				}
			}
		}
	}
}








