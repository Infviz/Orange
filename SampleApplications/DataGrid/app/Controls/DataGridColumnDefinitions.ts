
module Controls {
	
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

		public createCellElement(row: HTMLDivElement, rowContext: any): HTMLDivElement {

			var cellEl = document.createElement('div');
			cellEl.className = 'dg_cell';
			cellEl.innerHTML = '<span>' + rowContext[this._valueProperty] + '</span>';

			row.appendChild(cellEl);

			return cellEl;
		}

		public createHeaderElement(row: HTMLDivElement, rowContext: any) : HTMLDivElement {

			var cellEl = document.createElement('div');
			cellEl.className = 'dg_cell';
			cellEl.innerHTML = '<span>' + this._header + '</span>';

			row.appendChild(cellEl);

			return cellEl;
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
		
		constructor(
			cellTemplate: string, 
			headerTemplate: string, 
			sortProperty: string, 
			width?: number) {

			this._cellTemplate = cellTemplate;
			this._headerTemplate = headerTemplate;
			this._sortProperty = sortProperty;
			this._width = (<any>width == "undefined") ? null : width;
		}

		private createCell(innerHtml: string) : HTMLDivElement {

			var el = document.createElement('div');
			el.className = 'dg_cell';
			el.innerHTML = innerHtml;

			return el;
		}

		public createCellElement(row: HTMLDivElement, rowContext: any): HTMLDivElement {

			var el = this.createCell(this._cellTemplate);
			ko.applyBindings(rowContext, el);

			row.appendChild(el);	

			return el;
		}

		public createHeaderElement(row: HTMLDivElement, rowContext: any) : HTMLDivElement {

			var el = this.createCell(this._headerTemplate);

			if (!!rowContext)
				ko.applyBindings(rowContext, el);

			row.appendChild(el);

			return el;
		}
	}
}