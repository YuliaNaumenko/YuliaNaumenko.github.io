var BaseViewComponent = (function () {
    function BaseViewComponent() {
    }

    BaseViewComponent.prototype.renderTemplate = function(searchListViewHtml){
        throw "Method renderTemplate should be overridden by the child class";
    }

    BaseViewComponent.prototype.fetchTemplate = function (templateName) { 
        var _this = this;
        TemplateFetcher.current.fetchTemplateByPath(templateName, function() { 
            _this.renderTemplate.call(_this, this.responseText);
        });
    };

    BaseViewComponent.prototype.getElementByClassName = function (name) {
        try {
            var elements = document.getElementsByClassName(name);
            if (elements.length > 0) {
                return elements[0];
            } else {
                throw "DOM element with class name '" + name + "' does not exist.";
            }
        } catch (e) {
            console.error(e);
        }
    }

    return BaseViewComponent;

})(BaseViewComponent || {});