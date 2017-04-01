var Stream = (function () {
        function Stream(data) {
            if (data === void 0) { data = {}; }

            this.Id = data._id;
            this.PreviewImageUrl = data.preview.medium;
            this.DisplayName = data.channel.display_name;
            this.GameName = data.game;
            this.Viewers = data.viewers;
            this.Description = data.channel.status;
            this.StreamUrl = data.channel.url;
        }
        return Stream;
}());

var QueryInfo = (function () {
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
}());

var CallbackRegistry = {}; 

function JSONPHandler(url, onSuccess, onError) {
        var scriptOk = false;
        var callbackName = 'cb' + String(Math.random()).slice(-6);
        url += ~url.indexOf('?') ? '&' : '?';
        // client id should be read from configuration
        url += 'client_id=luqvyoa6utwz5evwsxo0tkjd3bdjk3&callback=CallbackRegistry.' + callbackName;

        CallbackRegistry[callbackName] = function(data) {
            scriptOk = true;
            document.body.removeChild(document.getElementById(callbackName));
            delete CallbackRegistry[callbackName];
            onSuccess(data);
        };

        function checkCallback() {
            if (scriptOk) return;
            delete CallbackRegistry[callbackName];
            onError(url);
        }

        var script = document.createElement('script');
        script.id = callbackName;

        script.onreadystatechange = function() {
            if (this.readyState == 'complete' || this.readyState == 'loaded') {
                this.onreadystatechange = null;
                setTimeout(checkCallback, 0);
            }
        }

        script.onload = script.onerror = checkCallback;
        script.src = url;

        document.body.appendChild(script);
};

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
        JSONPHandler(url, this.parseResult, this.errorHandler);
    }

    SearchStreamService.prototype.errorHandler = function(result) {
        console.error(result);
    };

	return SearchStreamService;
}(SearchStreamService || {}));

var DOMFunctions = (function () {
    function DOMFunctions() {
    }

    DOMFunctions.prototype.getElementByClassName = function (name) {
        var elements = document.getElementsByClassName(name);
        if (elements.length > 0) {
            return elements[0];
        } else {
            return null;
        }
    }

    DOMFunctions.prototype.bindEventByClassName = function (eventName, className, handlerFunction) {
        var element = this.getElementByClassName(className);
        if (element !== null) {
            element.addEventListener(eventName, handlerFunction);
        }
    }

    DOMFunctions.prototype.getTemplateWithData = function (data, template){
        for (var prop in data) {
            template = template.replace("{{" + prop + "}}", data[prop])
        }
        return template;
    }

    return DOMFunctions;

})(DOMFunctions || {});

var Spinner = (function () {
        function Spinner() {
            var domFunctions = new DOMFunctions();
            this.spinnerElement = domFunctions.getElementByClassName("spinner");
        }

        Spinner.prototype.show = function () {
            this.spinnerElement.className = this.spinnerElement.className.replace(" invisible", "");
        }

        Spinner.prototype.hide = function () {
            this.spinnerElement.className += " invisible";
        }
        return Spinner;
}());

var StreamsList = (function () {

    function StreamsList(viewHolderSelector) {
        var _this = this;
        _this.streamItems = [];
        _this.queryInfo = new QueryInfo();
        _this.spinner = new Spinner();
        _this.streamService = new SearchStreamService();
        _this.viewHolder = document.getElementsByClassName(viewHolderSelector)[0];

        _this.getStreamsList = function(streams, totalCount) {
            _this.streamItems = streams;
            _this.queryInfo.TotalCount = totalCount;
            _this.renderTemplate(`<div class="totalStreams">Total results: {{TotalCount}}</div>
                                    <div class="paging-control">
                                        <span class="prev-page"></span>
                                        <span>{{CurrentPage}}</span>
                                        <span> / </span>
                                        <span>{{TotalPages}}</span>
                                        <span class="next-page"></span>
                                    </div>
                                    <div class="stream-list">
                                        <ul class="streams"></ul>
                                    </div>`);
            _this.spinner.hide();
        }
        return _this;
    }

    StreamsList.prototype.executeSearch = function (pageDirection) {
        this.queryInfo.CurrentPage += pageDirection;
        this.spinner.show();
        this.streamService.getStreamCollection(this.queryInfo.SearchString, this.getStreamsList, this.queryInfo.CurrentPage);
    }

    StreamsList.prototype.activate = function (searchString) {
        this.queryInfo.SearchString = searchString;
        this.executeSearch(0);
    }

    StreamsList.prototype.renderTemplate = function (streamsListHtml){
            var domFunctions = new DOMFunctions();
            streamsListHtml = domFunctions.getTemplateWithData(this.queryInfo, streamsListHtml);
            this.viewHolder.innerHTML = streamsListHtml;

            if (this.queryInfo.TotalCount > 0) {
                var nextPageButton = domFunctions.getElementByClassName("next-page");
                if(this.queryInfo.TotalPages > this.queryInfo.CurrentPage) {
                    nextPageButton.addEventListener("click", this.executeSearch.bind(this, 1));
                }
                else {
                    nextPageButton.className += " invisible";
                }

                var prevPageButton = domFunctions.getElementByClassName("prev-page");
                if(this.queryInfo.CurrentPage > 1) {
                    prevPageButton.addEventListener("click", this.executeSearch.bind(this, -1));
                }
                else {
                    prevPageButton.className += " invisible";
                }
            }
            else {
                var pagingControl =  domFunctions.getElementByClassName("paging-control");  
                pagingControl.className += " invisible";
            }
            var streamItemsHolder = domFunctions.getElementByClassName("streams");

            for (i = 0; i < this.streamItems.length; i++) { 
                streamItemsHolder.insertAdjacentHTML("beforeend", domFunctions.getTemplateWithData(this.streamItems[i], `<li>
                                    <div class="stream-preview">
                                        <span></span><img src="{{PreviewImageUrl}}" />
                                    </div>
                                    <div class="stream-details">
                                        <h3>
                                            <a href="{{StreamUrl}}" class="stream-name">{{DisplayName}}</a>
                                        </h3>
                                        <div class="game-name">
                                            <span>{{GameName}}</span> - <span>{{Viewers}}</span> viewers
                                        </div>
                                        <div class="game-description">{{Description}}</div>
                                    </div>
                                </li>`));
            }
    }

    return StreamsList;

})(StreamsList || {});

var SearchListController = (function () {
    function SearchListController() {
        this.searchString = "";
    }

    SearchListController.prototype.init = function() {
        this.renderTemplate(`<div class="search-list-view">
                                    <div class="header-controls">
                                        <div class="search-control">
                                            <input type="text" class="searchString" placeholder="Search query..." />
                                            <button type="button" class="executeSearch">Search</button>
                                        </div>
                                    </div>
                                    <div class="search-list"></div>
                                </div>`);
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
        var output = document.getElementById("applicationHost");
        output.insertAdjacentHTML("beforeend", searchListViewHtml);
        var domFunctions = new DOMFunctions();
        domFunctions.bindEventByClassName("click", "executeSearch", this.refreshSearchList.bind(this));
        domFunctions.bindEventByClassName("keyup", "searchString", this.setSearchString.bind(this));
    }

    return SearchListController;

})(SearchListController || {});

var App = (function (app) {

  app.init = function () {
     SearchListController.init();
  };
  
  return app;

})(App || {});

App.init();