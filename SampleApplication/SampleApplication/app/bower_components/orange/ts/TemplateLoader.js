var TemplateLoader = (function () {
    function TemplateLoader() {
    }
    TemplateLoader.staticlyLoaded = function () {
        if (TemplateLoader.onload)
            TemplateLoader.onload();
    };
    TemplateLoader.load = function (templates) {
        var loadedTemplates = 0;
        for (var i = 0; i < templates.length; i++) {
            (function () {
                var tpl = templates[i];
                var id = tpl.id;
                $.get(tpl.path, function (tplCode) {
                    var code = '<script type="text/html" id="' + id + '">' + tplCode + '</script>';
                    $('body').append(code);
                    loadedTemplates++;
                    if (loadedTemplates == templates.length) {
                        if (TemplateLoader.onload)
                            TemplateLoader.onload();
                    }
                });
            })();
        }
        ;
    };
    return TemplateLoader;
})();
//# sourceMappingURL=TemplateLoader.js.map