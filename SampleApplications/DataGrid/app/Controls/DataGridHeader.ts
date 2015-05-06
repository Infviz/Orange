
module Controls {
	
	export class DataGridHeaderEventArgument {

    	private _header : DataGridHeader;
    	public get header() : DataGridHeader {
    		return this._header;
    	}

    	private _column : IDataGridColumnDefinition;
    	public get column() : IDataGridColumnDefinition {
    		return this._column;
    	}

    	private _event : any;
    	public get event() : any {
    		return this._event;
    	}

    	constructor(header: DataGridHeader, column: IDataGridColumnDefinition, evt: any) {
    		
    		this._header = header;
    		this._column = column;
    		this._event = evt;
    	}
    }

     export class DataGridHeader {

    	private _id : string;
    	public get id() : string {
    		return this._id;
    	}

    	private _context: any = null;
    	public get context() : any {
    		return this._context;
    	}

    	private _elementEventManager: HammerManager;
    	private _frozenElementEventManager: HammerManager;

    	private _element: HTMLDivElement = null;
    	private _frozenElement: HTMLDivElement = null;

    	private _columnDefinitions: Array<IDataGridColumnDefinition> = null;

    	private _calculateDistributedColumns = false;
    	private _frozenColumnCount = 0;

    	public onClicked = new Rx.Subject<DataGridHeaderEventArgument>();
    	public onDoubleClicked = new Rx.Subject<DataGridHeaderEventArgument>();

    	constructor(context: any, id: string, 
    		columnDefinitions: Array<IDataGridColumnDefinition>,
    		frozenColumnCount: number, 
    		calculateDistributedColumns: boolean) {
    		
    		this._context = context;
    		this._id = id;
    		this._columnDefinitions = columnDefinitions;
    		this._calculateDistributedColumns = calculateDistributedColumns;
    		this._frozenColumnCount = frozenColumnCount;
    	}

    	public getElement() : HTMLDivElement {

    		if (!this._element)
    		{
    			this._element = this.createRow();
    			this._elementEventManager = this.createEventListener(this._element);
    		}

			return this._element;
		}

		public getFrozenElement() : HTMLDivElement {

			if (this._frozenColumnCount < 1) return null;

			if (!this._frozenElement)
			{
    			this._frozenElement = this.createRow(this._frozenColumnCount);
    			this._frozenElementEventManager = this.createEventListener(this._frozenElement);
			}

			return this._frozenElement;
		}

		public dispose() : void {

			if (this._elementEventManager)
				this._elementEventManager.destroy();

			if (this._frozenElementEventManager)
				this._frozenElementEventManager.destroy();

			if (this._frozenElement) {
				Hammer.off(this._frozenElement, "mouseover", this.onMouseOver);
				Hammer.off(this._frozenElement, "mouseout", this.onMouseOut);
			}

			if (this._element){
				Hammer.off(this._element, "mouseover", this.onMouseOver);
				Hammer.off(this._element, "mouseout", this.onMouseOut);
			}

			this.onClicked.dispose();
			this.onDoubleClicked.dispose();
		}

		private createRow(columnCount?: number) : HTMLDivElement {

			var headerEl = document.createElement("div");
			headerEl.className = "dg_rows dg_header";
			
			var row = document.createElement("div");
			row.className = "dg_row";
			headerEl.appendChild(row);

			row.setAttribute("data-dg-row-id", this.id);

			var colsToCreateCount = !columnCount ? this._columnDefinitions.length : columnCount;

			for (var cIdx = 0; cIdx < colsToCreateCount; ++cIdx) {
				
				var columnDefinition = this._columnDefinitions[cIdx];

				var cellEl = columnDefinition.createHeaderElement(row, this._context);

				if (this._calculateDistributedColumns)
				{
					cellEl.style.minWidth = columnDefinition.width + "px";
					cellEl.style.width = (100.0 / this._columnDefinitions.length) + "%";
				}
				else
				{
					cellEl.style.width = columnDefinition.width + "px";
				}
			}

			return headerEl;
		}

		private createEventListener(element: HTMLDivElement) : HammerManager {

			var hammer = new Hammer.Manager(element, { });

			var singleTap = new Hammer.Tap({ event: 'singletap' });
			var doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2 });

			hammer.add([doubleTap, singleTap]);

			//doubleTap.recognizeWith(singleTap);
			//singleTap.requireFailure(doubleTap);

			hammer.on("singletap", this.onClick);
			hammer.on("doubletap", this.onDoubleClick);

			Hammer.on(element, "mouseover", this.onMouseOver);
			Hammer.on(element, "mouseout", this.onMouseOut);

			return hammer;
		}

		private onMouseOver = (event: any) => {

			var classes = this._element.className;

			$(this._element).addClass("hover");

			if (this._frozenElement)
				$(this._frozenElement).addClass("hover");
		}

		private onMouseOut = (event: any) => {

			var classes = this._element.className;

			$(this._element).removeClass("hover");

			if (this._frozenElement)
				$(this._frozenElement).removeClass("hover");
		}

		private onClick = (event: HammerInput) => {

			if (false == this.onClicked.hasObservers() || !(this._element))
				return;

			var def = this.findDefinitionFromEvent(event);

			if (def == null)
				return;

			this.onClicked.onNext(new DataGridHeaderEventArgument(this, def, event));
		}

		private onDoubleClick = (event: HammerInput) => {

			if (false == this.onClicked.hasObservers() || !(this._element))
				return;

			var def = this.findDefinitionFromEvent(event);

			if (def == null)
				return;
			
			this.onDoubleClicked.onNext(new DataGridHeaderEventArgument(this, def, event));
		}

		private findDefinitionFromEvent(event: HammerInput) : IDataGridColumnDefinition {
			
			var evtPos = event.center;

			var row = $(event.target).closest(".dg_row")[0];

			var collEls = row.childNodes;

			var targetCell: HTMLDivElement = null;

			var cIdx = 0;
			for (cIdx = 0 ; cIdx < collEls.length && targetCell == null ; cIdx++) {

				var collEl = <HTMLDivElement>collEls[cIdx];

				var cbb = collEl.getBoundingClientRect();

				var x = evtPos.x - cbb.left;
				var y = evtPos.y - cbb.top;

				if (x > 0 && x < cbb.width && y > 0 && y < cbb.height)
					targetCell = collEl;
			}

			if (targetCell == null)
				return null;

			return this._columnDefinitions[cIdx -1];
		}
    }


    export class DataGridHeaderasdfa {

    	private _hammer: HammerManager = null;
    	private _element: HTMLDivElement = null;

    	private _columnDefinitions: Array<IDataGridColumnDefinition> = null;
    	public get columnDefinitions() : Array<IDataGridColumnDefinition> {
    		return this._columnDefinitions;
    	}

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
}