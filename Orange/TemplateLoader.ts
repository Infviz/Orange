interface TemplateInfo {
    id: string;
    path: string;
}

class TemplateLoader {
    public static onload: () => void;

    static staticlyLoaded(): void {
		if (TemplateLoader.onload) TemplateLoader.onload();
    }

    static load(templates: Array<TemplateInfo>) : void {
        var loadedTemplates = 0;
        for (var i = 0; i < templates.length; i++)
        {
            (function () {
                var tpl = templates[i];
                var id = tpl.id;
                $.get(
                    tpl.path,
                    tplCode => {
                        var code = '<script type="text/html" id="' + id + '">' + tplCode + '</script>';
                        $('body').append(code);
                        loadedTemplates++;
                        if (loadedTemplates == templates.length)
                        {
                            if (TemplateLoader.onload) TemplateLoader.onload();
                        }
                    });
            })();
        };
    }
}
