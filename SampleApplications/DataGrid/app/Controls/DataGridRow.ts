/// <reference path="../_references.ts" />

module Controls {

	export class DataGridRowEventArgument {

    	private _row : IDataGridRow;
    	public get row() : IDataGridRow {
    		return this._row;
    	}

    	private _cell : HTMLDivElement;
    	public get cell() : HTMLDivElement {
    		return this._cell;
    	}

    	private _event : any;
    	public get event() : any {
    		return this._event;
    	}

    	constructor(row: IDataGridRow, cell: HTMLDivElement, evt: any) {
    		
    		this._row = row;
    		this._cell = cell;
    		this._event = evt;
    	}
    }

    export interface IDataGridRow {

    	id: string;
    	context: any;

    	onClicked: Rx.Subject<DataGridRowEventArgument>;
    	onDoubleClicked: Rx.Subject<DataGridRowEventArgument>;

    	getElement() : HTMLDivElement;
    	getFrozenElement() : HTMLDivElement;

    	dispose() : void;
    }

    export class DataGridRow implements IDataGridRow {

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

    	public onClicked = new Rx.Subject<DataGridRowEventArgument>();
    	public onDoubleClicked = new Rx.Subject<DataGridRowEventArgument>();

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

			var row = document.createElement("div");
			row.className = "dg_row";

			row.setAttribute("data-dg-row-id", this.id);

			var colsToCreateCount = !columnCount ? this._columnDefinitions.length : columnCount;

			for (var cIdx = 0; cIdx < colsToCreateCount; ++cIdx) {
				
				var columnDefinition = this._columnDefinitions[cIdx];

				var cellEl = columnDefinition.createCellElement(row, this._context);

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

			return row;
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

			// element.addEventListener("mouseover", this.onMouseOver);
			// element.addEventListener("mouseout", this.onMouseOut);

			return hammer;
		}


		private onMouseOver = (event: MouseEvent) => {

			var classes = this._element.className;

			$(this._element).addClass("hover");

			event.stopPropagation();

			if (this._frozenElement)
				$(this._frozenElement).addClass("hover");
		}

		private onMouseOut = (event: MouseEvent) => {

			var classes = this._element.className;

			$(this._element).removeClass("hover");

			event.stopPropagation();
			
			if (this._frozenElement)
				$(this._frozenElement).removeClass("hover");
		}

		private onClick = (event: HammerInput) => {

			if (false == this.onClicked.hasObservers())
				return;

			var cell = $(event.target).hasClass("dg-cell") ? <HTMLDivElement>event.target : null;
			
			this.onClicked.onNext(new DataGridRowEventArgument(this, cell, event));
		}

		private onDoubleClick = (event: HammerInput) => {

			if (false == this.onDoubleClicked.hasObservers())
				return;

			var cell = $(event.target).hasClass("dg-cell") ? <HTMLDivElement>event.target : null;
			
			this.onDoubleClicked.onNext(new DataGridRowEventArgument(this, cell, event));
		}
    }
}