/// <reference path="_references.ts" />

var startReq = { windowLoaded: false, templatesLoaded: true };

function tryStartup() {

    if (!startReq.windowLoaded || !startReq.templatesLoaded)
    	return;

    var application = new Application();
    application.run();
}

window.onload = () => {
    startReq.windowLoaded = true;
    tryStartup();
};

TemplateLoader.onload = () => {
    startReq.templatesLoaded = true;
    tryStartup();
};

class TemplatedCol3 {

    name: KnockoutObservable<string> = null;

    constructor(name: string) {
        this.name = ko.observable<string>(name);
    }
}

class RowItem {
    public col1: string;
    public col2: string;
    public col3: TemplatedCol3;
    public col4: string;
    public col5: string;
    public col6: string;
    public col7: string;
    public col8: string;
    public col9: string;
}

class Application {

	public run(): void {
		
		var container = new Orange.Modularity.Container();

		var controlManager = new Orange.Controls.ControlManager(container);
        
        container.registerInstance(Orange.Controls.ControlManager, controlManager);

        var dgControl = Orange.Controls.GetOrangeElement(document.getElementById("my_dg"));

        var alphabet = new Array<string>('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');

        var dgReady = 
            () => {

                var cols = new Array<Controls.IDataGridColumnDefinition>(
                    new Controls.TextColumnDefinition("col1","Column one", "col1", 100),
                    new Controls.TextColumnDefinition("col2","Column two", "col2", 100),

                    new Controls.TemplatedKnockoutColumnDefinition(
                        '<div>' +
                        '   <span class="glyphicon glyphicon-heart" aria-hidden="true"></span>' +
                        '   <span data-bind="text: col3.name">' +
                        '   </span>' +
                        '   <div class="btn-group" style="float: right;">' +
                        '       <button type="button" class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                        '           Action <span class="caret"></span>'+
                        '       </button>' +
                        '       <ul class="dropdown-menu" role="menu">' +
                        '           <li><a href="#">Action</a></li>' +
                        '           <li><a href="#">Another action</a></li> ' +
                        '           <li><a href="#">Something else here</a></li> ' +
                        '           <li class="divider"></li> ' +
                        '           <li><a href="#">Separated link</a></li>' +
                        '       </ul>' +
                        '   </div>'+ 
                        '</div>', 
                        '<span data-bind="text: col3Header"></span>',
                        "col3.name", 140),

                    new Controls.TextColumnDefinition("col4","Column four", "col4", 100),
                    new Controls.TextColumnDefinition("col5","Column five", "col5", 100),
                    new Controls.TextColumnDefinition("col6","Column six", "col6", 100),
                    new Controls.TextColumnDefinition("col7","Column seven", "col7", 100),
                    new Controls.TextColumnDefinition("col8","Column eight", "col8", 100),
                    new Controls.TextColumnDefinition("col9","Column nine", "col9", 100));

                var data = Ix.Enumerable.range(0, 2000)
                    .select(rIdx => {
                        
                        var rowItem = new RowItem();

                        rowItem.col1 = '' + rIdx + ' 1';
                        rowItem.col2 = alphabet[rIdx%alphabet.length];
                        rowItem.col3 = new TemplatedCol3(alphabet[rIdx%alphabet.length] + alphabet[rIdx%alphabet.length] + alphabet[rIdx%alphabet.length]);
                        rowItem.col4 = '' + rIdx + ' 4';
                        rowItem.col5 = '' + rIdx + ' 5';
                        rowItem.col6 = '' + rIdx + ' 6';
                        rowItem.col7 = '' + rIdx + ' 7';
                        rowItem.col8 = '' + rIdx + ' 8';
                        rowItem.col9 = '' + rIdx + ' 9';

                        return rowItem;
                    })
                    .toArray();

                // data[data.length-1].col2 = "a";

                var dg = <Controls.DataGrid>dgControl.control;
                
                dg.frozenColumnCount = 2;
                dg.columnDefinitions = cols;

                // dg.onClicked
                //     .subscribe((args) => {
                //         console.log(args);
                //     });

                var items = ko.observableArray<RowItem>(data);
                dg.itemsSource = items;

                dg.selectionHandler = new Controls.DataGridMultiSelectSelectionHandler();
                dg.headerContext = { col3Header: "Col 3 Header"};

                var counter = 1;
                Rx.Observable.interval(2000)
                    .take(0)
                    .subscribe(_ => {

                        var newItem = new RowItem();

                        newItem.col1 = '' + counter++; 
                        newItem.col2 = alphabet[Math.floor(Math.random() * alphabet.length)];
                        newItem.col3 = new TemplatedCol3(alphabet[Math.floor(Math.random() * alphabet.length)] + alphabet[Math.floor(Math.random() * alphabet.length)] + alphabet[Math.floor(Math.random() * alphabet.length)]);
                        newItem.col4 = 'inserted 4';
                        newItem.col5 = 'inserted 5';
                        newItem.col6 = 'inserted 6';
                        newItem.col7 = 'inserted 7';
                        newItem.col8 = 'inserted 8';
                        newItem.col9 = 'inserted 9';

                        items.splice(Math.floor(Math.random() * items().length), 0, newItem);
                        //items.splice(Math.floor(Math.random() * items().length), 1);
                    });

                // Rx.Observable.interval(5000)
                //     .take(2)
                //     .subscribe(_ => {
                //         items.sort(function(left, right) { return left.col2 == right.col2 ? 0 : (left.col2 < right.col2 ? -1 : 1) });
                //     });

                // Rx.Observable.interval(11000)
                //     .take(10)
                //     .subscribe(_ => {
                //         items.splice(Math.floor(Math.random() * items().length), 1);
                //     });
            };

        dgControl.addOnInitializedListener(dgReady);

        controlManager.manage(document.body);
	}
}


