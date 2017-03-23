var TemplateFetcher = (function () {

    function TemplateFetcher() {
    }

    TemplateFetcher.prototype.fetchTemplateByPath = function (filePath, fnCallback) {
        var xhr = new XMLHttpRequest();
        xhr.callback = fnCallback;
        xhr.onload = function (e) {
            if (this.status === 200) {
                this.callback.apply(this); 
            }
        };
        
        xhr.onerror = function (e) {
            console.error(this.statusText);
        };

        xhr.open("GET", filePath, true);
        xhr.send();
    }

    TemplateFetcher.init = function () {
        var templateFetcher = new this();
        return TemplateFetcher.current = templateFetcher;
    };

    return TemplateFetcher;
}(TemplateFetcher || {}));



