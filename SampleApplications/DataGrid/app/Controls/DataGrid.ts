/// <reference path="../_references.ts" />

module Controls {

	export interface IDataGridColumnDefinition {

		width: number;
		sortProperty: string;
		createCellElement(row: HTMLDivElement, rowContext: any) : void;
		createHeaderElement(row: HTMLDivElement, rowContext: any) : void;
	}

	export class TextColumnDefinition implements IDataGridColumnDefinition {

		private _valueProperty: string = "";

		private _width : number;
		public get width() : number {
			return this._width;
		}
		public set width(v : number) {
			this._width = v;
		}

		private _header : string;
		public get header() : string {
			return this._header;
		}

		private _sortProperty : string;
		public get sortProperty() : string {
			return this._sortProperty;
		}

		constructor(valueProperty: string, header: string, sortProperty: string, width?: number) {

			this._valueProperty = valueProperty;
			this._header = header;
			this._width = (<any>width == "undefined") ? null : width;
			this._sortProperty = sortProperty ? sortProperty : valueProperty;
		}

		public createCellElement(row: HTMLDivElement, rowContext: any): void {

			var cellEl = document.createElement('div');
			cellEl.className = 'dg_cell';
			cellEl.innerHTML = '<span>' + rowContext[this._valueProperty] + '</span>';

			cellEl.style.width = this._width + "px";

			row.appendChild(cellEl);
		}

		public createHeaderElement(row: HTMLDivElement, rowContext: any) : void {

			var cellEl = document.createElement('div');
			cellEl.className = 'dg_cell';
			cellEl.innerHTML = '<span>' + this._header + '</span>';
			cellEl.style.width = this._width + "px";

			row.appendChild(cellEl);
		}
	}

	export class TemplatedKnockoutColumnDefinition implements IDataGridColumnDefinition {

		private _cellTemplate: string = "";
		private _headerTemplate : string;
		
		private _sortProperty : string;
		public get sortProperty() : string {
			return this._sortProperty;
		}

		private _width : number;
		public get width() : number {
			return this._width;
		}
		public set width(v : number) {
			this._width = v;
		}
		
		constructor(cellTemplate: string, headerTemplate: string, sortProperty: string, width?: number) {

			this._cellTemplate = cellTemplate;
			this._headerTemplate = headerTemplate;
			this._sortProperty = sortProperty;
			this._width = (<any>width == "undefined") ? null : width;
		}

		public createCellElement(row: HTMLDivElement, rowContext: any): void {

			var cellEl = document.createElement('div');
			cellEl.className = 'dg_cell';
			cellEl.innerHTML = this._cellTemplate;

			cellEl.style.width = this._width + "px";

			ko.applyBindings(rowContext, cellEl);

			row.appendChild(cellEl);	
		}

		public createHeaderElement(row: HTMLDivElement, rowContext: any) : void {

			var el = document.createElement('div');
			el.className = 'dg_cell';
			el.innerHTML = this._headerTemplate;

			el.style.width = this._width + "px";

			row.appendChild(el);
		}
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

    // export class DataGridCell {

    // 	private _hammer: HammerManager = null;
    // 	private _element: HTMLDivElement = null;
    // 	private _columnDefinition: IDataGridColumnDefinition = null;
    // 	private _parentRow: DataGridRow = null;

    // 	constructor(parentRow: DataGridRow, columnDefinition: IDataGridColumnDefinition) {

    // 		this._parentRow = parentRow;
    // 		this._columnDefinition = columnDefinition;
    // 	}

    // 	public getElement() : HTMLDivElement {

    // 		this._columnDefinition.createCellElement(row, this._context);
    // 	}

    // 	public dispose() {

    // 	}
    // }

    export class DataGridRow {

    	private _hammer: HammerManager = null;
    	private _element: HTMLDivElement = null;
    	private _columnDefinitions: Array<IDataGridColumnDefinition> = null;

    	private _isRendered = false;

    	private _id : string;
    	public get id() : string {
    		return this._id;
    	}

    	private _context: any = null;
    	public get context() : any {
    		return this._context;
    	}

    	constructor(context: any, id: string, columnDefinitions: Array<IDataGridColumnDefinition>) {
    		
    		this._context = context;
    		this._id = id;
    		this._columnDefinitions = columnDefinitions;

    	}

    	public getElement() : HTMLDivElement {

    		if (!this._element)
    			this.init();

			return this._element;
		}

		public dispose() {

			this._hammer.destroy();
		}

		private init() {

			var row = document.createElement("div");
			row.className = "dg_row";

			row.setAttribute("data-dg-row-id", this.id);

			for (var cIdx = 0; cIdx < this._columnDefinitions.length; ++cIdx) {
				
				var columnDefinition = this._columnDefinitions[cIdx];

				columnDefinition.createCellElement(row, this._context);
			}

			this._element = row;

			this._hammer = new Hammer.Manager(row, { });

			var singleTap = new Hammer.Tap({ event: 'singletap' });
			var doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2 });

			this._hammer.add([doubleTap, singleTap]);

			doubleTap.recognizeWith(singleTap);
			singleTap.requireFailure(doubleTap);

			this._hammer.on("singletap", this.onClick);
			this._hammer.on("doubletap", this.onDoubleClick);
		}

		private onClick = (event: HammerInput) => {

			console.log("Row " + this._element.getAttribute("data-dg-row-id") + " was clicked.");
			console.log(event);
		}

		private onDoubleClick = (event: HammerInput) => {

			console.log("Row " + this._element.getAttribute("data-dg-row-id") + " was double clicked.");
			console.log(event);
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

    	constructor(
    		context: any, 
    		columnDefinitions: Array<IDataGridColumnDefinition>,
    		dataGridElement: HTMLDivElement
    		) {
    		
    		this._context = context;
    		this._columnDefinitions = columnDefinitions;
    		this._dgContainer = dataGridElement;
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

			for (var cIdx = 0; cIdx < this._columnDefinitions.length; ++cIdx) {
				
				var colItem = this._columnDefinitions[cIdx];

				colItem.createHeaderElement(rowEl, this._context);
			}

			bodyHeader.appendChild(headerEl);
			frozenHeader.innerHTML = bodyHeader.innerHTML;
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
		}

		protected onApplyTemplate(): void {

			super.onApplyTemplate();

			var el = this.element;

			this._body = <HTMLDivElement>el.querySelector("div.data_grid .dg_body_container .dg_body:not(.dg_frozen)");
			this._frozenColumns = <HTMLDivElement>el.querySelector("div.data_grid .dg_body.dg_frozen");
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

			var row = new DataGridRow(context, this.createUId(), this._columnDefinitions);
			this._rowIdToElementDictionary[row.id] = row;

			var rows = <HTMLDivElement>this._body.firstElementChild;

			if (<any>index == "undefined" || index == null) {
				rows.appendChild(row.getElement());
			}
			else {
				rows.insertBefore(row.getElement(), rows.children[index]);
			}
		}

		private recreateHeader() : void {

			if (this._header != null) {
				this._header.dispose();
				this._header = null;
			}

			var context = {};
			this._header = new DataGridHeader(context, this._columnDefinitions, <HTMLDivElement>this.element);

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








