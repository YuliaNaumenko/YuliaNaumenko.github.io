var Stream = (function () {
        function Stream(data) {
            if (data === void 0) { data = {}; }

            this.Id = data._id;
            this.PreviewImageUrl = data.preview.medium;
            this.DisplayName = data.channel.display_name;
            this.GameName = data.game;
            this.Viewers = data.viewers;
            this.Description = data.channel.status;
        }
        return Stream;
}());;var QueryInfo = (function () {
        function QueryInfo(searchString, totalCount, currentPage) {

            this.SearchString = searchString || "";
            this.TotalCount = totalCount || 0;
            this.CurrentPage = currentPage || 1;
        }

        Object.defineProperty(QueryInfo.prototype, "TotalPages", {
            get: function () {
                if (this.TotalCount > 0) {
                    return Math.ceil(this.TotalCount / 5)
                }
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        return QueryInfo;
}());;var CallbackRegistry = {};        

var JSONPHandler = (function () {
    function JSONPHandler() {
    }

    JSONPHandler.prototype.load = function(url, onSuccess, onError) {
        var scriptOk = false;
        var callbackName = 'cb' + String(Math.random()).slice(-6);
        url += ~url.indexOf('?') ? '&' : '?';
        // client id should be read from configuration
        url += 'client_id=luqvyoa6utwz5evwsxo0tkjd3bdjk3&callback=CallbackRegistry.' + callbackName;

        CallbackRegistry[callbackName] = function(data) {
            scriptOk = true;
            delete CallbackRegistry[callbackName];
            onSuccess(data);
        };

        function checkCallback() {
            if (scriptOk) return;
            delete CallbackRegistry[callbackName];
            onError(url);
        }

        var script = document.createElement('script');

        script.onreadystatechange = function() {
            if (this.readyState == 'complete' || this.readyState == 'loaded') {
            this.onreadystatechange = null;
                setTimeout(checkCallback, 0);
            }
        }

        script.onload = script.onerror = checkCallback;
        script.src = url;

        document.body.appendChild(script);
    }

    return JSONPHandler;

}(JSONPHandler || {}));;//= require app/helpers/JSONPHandler.js
//= require app/models/Stream.js

var SearchStreamService = (function () {

    function SearchStreamService() {
        var _this = this;
        _this.parseResult = function(result) {
            var totalCount = result._total;
            var streams = result.streams || [];
            var parsedStreams = [];
            for (i = 0; i < streams.length; i++) { 
                parsedStreams.push(new Stream(streams[i]));
            }
            _this.fnCallback(parsedStreams, totalCount);
        };

        _this.jsonpHandler = new JSONPHandler();
        return _this;
    }

    SearchStreamService.prototype.getStreamCollection = function (searchString, fnCallback, pageNumber, limit) {
        var url = "https://api.twitch.tv/kraken/search/streams?query=";
        url += encodeURIComponent(searchString);
        if (typeof (limit) !== "number" || limit <= 0) {
            limit = 5;
        }
        if (typeof (pageNumber) === "number" && pageNumber > 1) {
            var offset = (pageNumber - 1) * limit;
            url += '&offset=' + offset;
        }
        url += '&limit=' + limit;
        this.fnCallback = fnCallback;
        this.jsonpHandler.load(url, this.parseResult, this.errorHandler);
    }

    SearchStreamService.prototype.errorHandler = function(result) {
        console.error(result);
    };

	return SearchStreamService;
}(SearchStreamService || {}));
;var TemplateFetcher = (function () {

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



;//= require app/helpers/templateFetcher.js

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

})(BaseViewComponent || {});;//= require app/components/BaseViewComponent.js

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var StreamListItem = (function (_super) {
    __extends(StreamListItem, _super);
    function StreamListItem(streamItem, viewHolderSelector) {
            _super.call(this);
            this.streamItem = streamItem;
            this.viewHolder = document.getElementsByClassName(viewHolderSelector)[0];
        }

        StreamListItem.prototype.activate = function() {
            this.fetchTemplate("app/templates/StreamListItem.html");
        }

        StreamListItem.prototype.renderTemplate = function(searchListItemHtml){
            var _this = this;
            for (var prop in _this.streamItem) {
                searchListItemHtml = searchListItemHtml.replace("{{" + prop + "}}", _this.streamItem[prop])
            }
            _this.viewHolder.innerHTML = _this.viewHolder.innerHTML + searchListItemHtml;
        }

        return StreamListItem;

}(BaseViewComponent || {}));;//= require app/components/BaseViewComponent.js
//= require app/components/StreamListItem.js
//= require app/services/SearchStreamService.js
//= require app/models/QueryInfo.js

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var StreamsList = (function (_super) {
    __extends(StreamsList, _super);
    function StreamsList(viewHolderSelector) {
        _super.call(this);
        var _this = this;
        _this.streamItems = [];
        _this.queryInfo = new QueryInfo();

        _this.streamService = new SearchStreamService();
        _this.viewHolder = document.getElementsByClassName(viewHolderSelector)[0];

        _this.getStreamsList = function(streams, totalCount) {
            _this.streamItems = streams;
            _this.queryInfo.TotalCount = totalCount;
            _this.fetchTemplate("app/templates/StreamsList.html");
        }

        return _this;
    }

    StreamsList.prototype.executeSearch = function(increasePage) {
        this.queryInfo.CurrentPage += increasePage;
        this.streamService.getStreamCollection(this.queryInfo.SearchString, this.getStreamsList, this.queryInfo.CurrentPage);
    }

    StreamsList.prototype.activate = function(searchString) {
        this.queryInfo.SearchString = searchString;
        this.executeSearch(0);
    }

     StreamsList.prototype.renderTemplate = function(streamsListHtml){
            var _this = this;
            for (var prop in _this.queryInfo) {
                streamsListHtml = streamsListHtml.replace("{{" + prop + "}}", _this.queryInfo[prop])
            }
            _this.viewHolder.innerHTML = streamsListHtml;

            if (_this.queryInfo.TotalCount > 0) {
                var nextPageButton = this.getElementByClassName("next-page");
                if(_this.queryInfo.TotalPages > _this.queryInfo.CurrentPage) {
                    nextPageButton.addEventListener("click", _this.executeSearch.bind(_this, 1));
                }
                else {
                    nextPageButton.style.visibility = "hidden";
                }

                var prevPageButton = this.getElementByClassName("prev-page");
                if(_this.queryInfo.CurrentPage > 1) {
                    prevPageButton.addEventListener("click", _this.executeSearch.bind(_this, -1));
                }
                else {
                    prevPageButton.style.visibility = "hidden";
                }
            }
            else {
                var pagingControl =  this.getElementByClassName("paging-control");  
                pagingControl.style.visibility = "hidden";
            }

            for (i = 0; i < _this.streamItems.length; i++) { 
                var streamListItem = new StreamListItem(_this.streamItems[i], "streams");
                streamListItem.activate();
            }
    }

    return StreamsList;

})(BaseViewComponent || {});;//= require app/components/BaseViewComponent.js
//= require app/components/StreamsList.js

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var SearchListController = (function (_super) {
    __extends(SearchListController, _super);
    function SearchListController() {
        _super.call(this);
        this.searchString = "";
    }

    SearchListController.prototype.init = function() {
        this.fetchTemplate("app/templates/SearchListView.html");
    }

    SearchListController.prototype.refreshSearchList = function (ev) {
        if (!this.searchString || this.searchString === "") {
            alert("Search query is required. Please enter the value.");
        }else {
            var streamsList = new StreamsList("search-list");           
            streamsList.activate(this.searchString);
        }
    };

    SearchListController.init = function () {
        var searchListController = new this();
        return searchListController.init();
    };

    SearchListController.prototype.setSearchString = function (ev) {
        ev.preventDefault();
        if (ev.keyCode == 13) {
            this.refreshSearchList();
        }
        else {
            this.searchString = ev.target.value;
        }
    };

    SearchListController.prototype.renderTemplate = function(searchListViewHtml){
        var _this = this;
        var output = document.getElementById("applicationHost");
        output.innerHTML = output.innerHTML + searchListViewHtml;
        _this.getElementByClassName("executeSearch").addEventListener("click", _this.refreshSearchList.bind(_this));
        _this.getElementByClassName("searchString").addEventListener("keyup", _this.setSearchString.bind(_this));
    }

    return SearchListController;

})(BaseViewComponent || {});;//= require app/controllers/SearchListController.js
//= require app/helpers/templateFetcher.js

var App = (function (app) {

  app.init = function () {
     TemplateFetcher.init();
     SearchListController.init();
  };
  
  return app;

})(App || {});

App.init();