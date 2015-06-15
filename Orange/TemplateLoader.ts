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

                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = 
                    () => {
                        if (xmlhttp.readyState !== 4) 
                            return;

                        if (xmlhttp.status !== 200 && xmlhttp.status !== 0) 
                            throw "Failed to load template.";
 
                        var scriptEl = document.createElement("script");
                        
                        var typeAttr = document.createAttribute("type");
                        typeAttr.value = "text/html";

                        var idAttr = document.createAttribute("id");
                        idAttr.value = id;

                        scriptEl.setAttributeNode(typeAttr);
                        scriptEl.setAttributeNode(idAttr);

                        scriptEl.innerHTML = xmlhttp.responseText;
                        document.body.appendChild(scriptEl);

                        loadedTemplates++;

                        if (loadedTemplates == templates.length && TemplateLoader.onload)
                            TemplateLoader.onload();
                    };

                xmlhttp.open("GET", tpl.path, true);
                xmlhttp.send();
            })();
        };
    }
}
