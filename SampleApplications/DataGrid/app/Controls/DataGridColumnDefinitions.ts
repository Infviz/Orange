
module Controls {
	
	export class TextColumnDefinition implements IDataGridColumnDefinition {

		private _valueProperty: string = "";
		private _sortProperty : string;

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

		constructor(
			valueProperty: string, 
			header: string, 
			sortProperty: string, 
			width: number, 
			compareFunc?: (a: any, b: any) => number) {

			this._header = header;
			this._width = width;

			this._valueProperty = valueProperty.replace("[", ".").replace("]", ".");

			if (sortProperty)
				this._sortProperty = sortProperty.replace("[", ".").replace("]", ".");
			else
				this._sortProperty = valueProperty;

			if (compareFunc)
				this.compare = compareFunc;
		}

		public getSortValue(context: any) {
			return this.getValueFromPath(this._sortProperty, context);
		}

		private getValueFromPath(path: string, obj: any) {

			return path
				.split('.')
				.reduce((p, c) => p ? p[c] : undefined, obj);
		}

		public compare = (a: any, b: any) => a == b ? 0 : (a < b ? -1 : 1);

		public createCellElement(row: HTMLDivElement, rowContext: any): HTMLDivElement {

			var cellEl = document.createElement('div');
			cellEl.className = 'dg_cell';
			cellEl.innerHTML = '<span>' + this.getValueFromPath(this._valueProperty, rowContext) + '</span>';

			row.appendChild(cellEl);

			return cellEl;
		}

		public createHeaderElement(row: HTMLDivElement, rowContext: any) : HTMLDivElement {

			var cellEl = document.createElement('div');
			cellEl.className = 'dg_cell dg_text_column_cell';
			cellEl.innerHTML = 
				'<div>' +
					'<span class="glyphicon glyphicon-triangle-bottom dg_sort_icon" aria-hidden="true"></span>' +
					'<span class="glyphicon glyphicon-triangle-top dg_inverted_sort_icon" aria-hidden="true"></span>' +
					'<span>' + this._header + '</span>'+
				'</div>'

			row.appendChild(cellEl);

			return cellEl;
		}
	}

	export class TemplatedKnockoutColumnDefinition implements IDataGridColumnDefinition {

		private _cellTemplate: string = "";
		private _headerTemplate : string = "";
		private _sortProperty: string = "";

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

		public getSortValue(context: any) {
			return ko.unwrap(this.getValueFromPath(this._sortProperty, context));
		}

		private getValueFromPath(path: string, obj: any) {;

			return path
				.split('.')
				.reduce((p, c) => p ? p[c] : undefined, obj);
		}

		public compare = (a: any, b: any) => a == b ? 0 : (a < b ? -1 : 1);

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