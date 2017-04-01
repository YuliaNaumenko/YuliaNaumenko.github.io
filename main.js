class Stream {
    constructor(data) {
        if (data === void 0) { data = {}; }

        this.Id = data._id;
        this.PreviewImageUrl = data.preview ? data.preview.medium : "";
        this.GameName = data.game;
        this.Viewers = data.viewers;
        if (data.channel) {
            this.defineChannelProperties(data.channel);
        }
    }

    defineChannelProperties(dataChannel) {
        this.DisplayName = dataChannel.display_name;
        this.Description = dataChannel.status;
        this.StreamUrl = dataChannel.url;
    }
}

class QueryInfo {
    constructor(searchString, totalCount, currentPage) {
        this.SearchString = searchString || "";
        this.TotalCount = totalCount || 0;
        this.CurrentPage = currentPage || 1;

        Object.defineProperty(this, 'TotalPages', {
            enumerable: true,
            get: () => { return this.TotalCount > 0 ? Math.ceil(this.TotalCount / 5) : 0; }
        });
    }
}

 
const CallbackRegistry = {};

class JSONPHandler {
    constructor(url, onSuccess, onError){
        let scriptOk = false;
        const callbackName = 'cb' + String(Math.random()).slice(-6);
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

        const script = document.createElement('script');
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
    }
}

class SearchStreamService {
    constructor() {
        const _this = this;
        this.parseResult = function (result) {
            const totalCount = result._total;
            const streams = result.streams || [];
            const parsedStreams = [];
            for (let i = 0; i < streams.length; i++) { 
                parsedStreams.push(new Stream(streams[i]));
            }
            _this.fnCallback(parsedStreams, totalCount);
        }
    }

    getStreamCollection(searchString, fnCallback, pageNumber, limit) {
        let url = "https://api.twitch.tv/kraken/search/streams?query=";
        url += encodeURIComponent(searchString);
        if (typeof (limit) !== "number" || limit <= 0) {
            limit = 5;
        }
        if (typeof (pageNumber) === "number" && pageNumber > 1) {
            const offset = (pageNumber - 1) * limit;
            url += '&offset=' + offset;
        }
        url += '&limit=' + limit;
        this.fnCallback = fnCallback;
        new JSONPHandler(url, this.parseResult, this.errorHandler);
    }

    errorHandler(result) {
        console.error(result);
    };
}

class DOMFunctions {
    getElementByClassName(name) {
        const elements = document.getElementsByClassName(name);
        if (elements.length > 0) {
            return elements[0];
        } else {
            return null;
        }
    }

    bindEventByClassName(eventName, className, handlerFunction) {
        const element = this.getElementByClassName(className);
        if (element !== null) {
            element.addEventListener(eventName, handlerFunction);
        }
    }

    getTemplateWithData (data, template){
        for (let prop in data) {
            template = template.replace("{{" + prop + "}}", data[prop])
        }
        return template;
    }
}

class Spinner {
    constructor() {
        const domFunctions = new DOMFunctions();
        this.spinnerElement = domFunctions.getElementByClassName("spinner");
    }

    show() {
        this.spinnerElement.className = this.spinnerElement.className.replace(" invisible", "");
    }

    hide() {
        this.spinnerElement.className += " invisible";
    }
}

class StreamsList {
    constructor(viewHolderSelector) {
        const _this = this;
        _this.streamItems = [];
        _this.queryInfo = new QueryInfo();
        _this.spinner = new Spinner();
        _this.streamService = new SearchStreamService();
        _this.viewHolder = document.getElementsByClassName(viewHolderSelector)[0];
        _this.domFunctions = new DOMFunctions();

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
    }

    executeSearch(pageDirection) {
        this.queryInfo.CurrentPage += pageDirection;
        this.spinner.show();
        this.streamService.getStreamCollection(this.queryInfo.SearchString, this.getStreamsList, this.queryInfo.CurrentPage);
    }

    activate(searchString) {
        this.queryInfo.SearchString = searchString;
        this.executeSearch(0);
    }

    renderTemplate(streamsListHtml){
            streamsListHtml = this.domFunctions.getTemplateWithData(this.queryInfo, streamsListHtml);
            this.viewHolder.innerHTML = streamsListHtml;

            if (this.queryInfo.TotalCount > 0) {
                const nextPageButton = this.domFunctions.getElementByClassName("next-page");
                if(this.queryInfo.TotalPages > this.queryInfo.CurrentPage) {
                    nextPageButton.addEventListener("click", this.executeSearch.bind(this, 1));
                }
                else {
                    nextPageButton.className += " invisible";
                }

                const prevPageButton = this.domFunctions.getElementByClassName("prev-page");
                if(this.queryInfo.CurrentPage > 1) {
                    prevPageButton.addEventListener("click", this.executeSearch.bind(this, -1));
                }
                else {
                    prevPageButton.className += " invisible";
                }
            }
            else {
                const pagingControl =  this.domFunctions.getElementByClassName("paging-control");  
                pagingControl.className += " invisible";
            }
            const streamItemsHolder = this.domFunctions.getElementByClassName("streams");

            for (let i = 0; i < this.streamItems.length; i++) { 
                streamItemsHolder.insertAdjacentHTML("beforeend", this.domFunctions.getTemplateWithData(this.streamItems[i], `<li>
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
}

class SearchListController {
    constructor() {
        this.searchString = "";
        this.domFunctions = new DOMFunctions();
    }

    init() {
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

    refreshSearchList() {
        if (!this.searchString || this.searchString === "") {
            alert("Search query is required. Please enter the value.");
        }else {
            const streamsList = new StreamsList("search-list");           
            streamsList.activate(this.searchString);
        }
    }

    setSearchString(event) {
        event.preventDefault();
        if (event.keyCode == 13) {
            this.refreshSearchList();
        }
        else {
            this.searchString = event.target.value;
        }
    }

    renderTemplate(searchListViewHtml) {
        const output = document.getElementById("applicationHost");
        output.insertAdjacentHTML("beforeend", searchListViewHtml);

        this.domFunctions.bindEventByClassName("click", "executeSearch", this.refreshSearchList.bind(this));
        this.domFunctions.bindEventByClassName("keyup", "searchString", this.setSearchString.bind(this));
    }

    static init() {
        const searchListController = new SearchListController();
        return searchListController.init();
    }
}

class App {
    static init() {
        SearchListController.init();
    };
}

App.init();