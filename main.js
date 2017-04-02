
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
    constructor(searchString, totalCount = 0, currentPage = 1, itemsPerPage = 5) {
        this.SearchString = searchString;
        this.TotalCount = totalCount;
        this.CurrentPage = currentPage;
        this.ItemsPerPage = itemsPerPage;

        Object.defineProperty(this, "TotalPages", {
            enumerable: true,
            get: () => { return this.TotalCount > 0 ? Math.ceil(this.TotalCount / 5) : 0; }
        });
    }
}

const CallbackRegistry = {};

class JSONPHandler {

    fetchTwitchData(url, clientId = "luqvyoa6utwz5evwsxo0tkjd3bdjk3") {
        return new Promise((resolve, reject) => {
            let scriptOk = false;
            const callbackName = `cb${String(Math.random()).slice(-6)}`;
            url = `${url}${~url.indexOf("?") ? "&" : "?"}client_id=${clientId}&callback=CallbackRegistry.${callbackName}`;

            CallbackRegistry[callbackName] = function(data) {
                scriptOk = true;
                document.body.removeChild(document.getElementById(callbackName));
                delete CallbackRegistry[callbackName];
                resolve(data);
            };

            const script = document.createElement("script");
            script.id = callbackName;
            script.onload = script.onerror = () => {
                if (scriptOk) return;
                delete CallbackRegistry[callbackName];
                reject(url);
            };
            script.src = url;

            document.body.appendChild(script);
        });
    }
}

class SearchStreamService {
    constructor() {
        this.jpHandler = new JSONPHandler();
    }

    getStreamCollection(searchString, pageNumber, limit) {
        let url = `https://api.twitch.tv/kraken/search/streams?query=${encodeURIComponent(searchString)}`;
        if (typeof (limit) !== "number" || limit <= 0) {
            limit = 5;
        }
        if (typeof (pageNumber) === "number" && pageNumber > 1) {
            const offset = (pageNumber - 1) * limit;
            url = `${url}&offset=${offset}`;
        }
        url = `${url}&limit=${limit}`;

        return this.jpHandler.fetchTwitchData(url).then(result => {
            const totalCount = result._total;
            const streams = result.streams || [];
            const streamItems = [];
            streams.forEach(stream => { 
                streamItems.push(new Stream(stream));
            });
            return { streamItems, totalCount };
        });
    }
}

class DOMFunctions {
    getElementByClassName(name) {
        const elements = document.getElementsByClassName(name);
        return elements.length > 0 ? elements[0] : null;
    }

    bindEventByClassName(eventName, className, handlerFunction) {
        const element = this.getElementByClassName(className);
        if (element !== null) {
            element.addEventListener(eventName, handlerFunction);
        }
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
    constructor() {
        this.queryInfo = new QueryInfo();
        this.spinner = new Spinner();
        this.viewHolderSelector = "";
    }

    executeSearch(pageDirection) {
        this.queryInfo.CurrentPage += pageDirection;
        this.spinner.show();
        const streamService = new SearchStreamService();        
        streamService.getStreamCollection(this.queryInfo.SearchString, this.queryInfo.CurrentPage).then(result => {
            this.queryInfo.TotalCount = result.totalCount;
            this.renderTemplate(this.queryInfo, result.streamItems);
            this.spinner.hide();
        });
    }

    activate(searchString, viewHolderSelector) {
        this.queryInfo.SearchString = searchString;
        this.viewHolderSelector = viewHolderSelector;
        this.executeSearch(0);
    }

    renderTemplate(queryInfo, streamItems) {
        const domFunctions = new DOMFunctions();
        const prevBtnVisibilityClass = queryInfo.CurrentPage > 1 ? "" : " invisible";
        const nextBtnVisibilityClass = queryInfo.TotalPages > queryInfo.CurrentPage ? "" : " invisible";
        const pagingVisibilityClass = queryInfo.TotalCount > 0 ? "" : " invisible";
        const viewHolder = domFunctions.getElementByClassName(this.viewHolderSelector);
        
        viewHolder.innerHTML = `<div class="totalStreams">Total results: ${queryInfo.TotalCount}</div>
                                <div class="paging-control${pagingVisibilityClass}">
                                    <span class="prev-page${prevBtnVisibilityClass}"></span>
                                    <span>${queryInfo.CurrentPage}</span>
                                    <span> / </span>
                                    <span>${queryInfo.TotalPages}</span>
                                    <span class="next-page${nextBtnVisibilityClass}"></span>
                                </div>
                                <div class="stream-list">
                                    <ul class="streams"></ul>
                                </div>`;

        if (queryInfo.TotalCount > 0) {
            if(queryInfo.TotalPages > queryInfo.CurrentPage) {
                domFunctions.bindEventByClassName("click", "next-page", this.executeSearch.bind(this, 1))
            }

            if(queryInfo.CurrentPage > 1) {
                domFunctions.bindEventByClassName("click", "prev-page", this.executeSearch.bind(this, -1))
            }
        }

        const streamItemsHolder = domFunctions.getElementByClassName("streams");
        streamItems.forEach(streamItem => { 
            streamItemsHolder.insertAdjacentHTML("beforeend", `<li>
                                <div class="stream-preview">
                                    <span></span><img src="${streamItem.PreviewImageUrl}" />
                                </div>
                                <div class="stream-details">
                                    <h3>
                                        <a href="${streamItem.StreamUrl}" class="stream-name">${streamItem.DisplayName}</a>
                                    </h3>
                                    <div class="game-name">
                                        <span>${streamItem.GameName}</span> - <span>${streamItem.Viewers}</span> viewers
                                    </div>
                                    <div class="game-description">${streamItem.Description}</div>
                                </div>
                            </li>`);
        });
    }
}

class SearchListController {
    constructor() {
        this.searchString = "";
    }

    init() {
        this.renderTemplate();
    }

    refreshSearchList() {
        if (!this.searchString || this.searchString === "") {
            alert("Search query is required. Please enter the value.");
        } else {
            const streamsList = new StreamsList();           
            streamsList.activate(this.searchString, "search-list");
        }
    }

    setSearchString(event) {
        event.preventDefault();
        if (event.keyCode == 13) {
            this.refreshSearchList();
        } else {
            this.searchString = event.target.value;
        }
    }

    renderTemplate() {
        const output = document.getElementById("applicationHost");
        output.insertAdjacentHTML("beforeend", `<div class="search-list-view">
                                    <div class="header-controls">
                                        <div class="search-control">
                                            <input type="text" class="searchString" placeholder="Search query..." />
                                            <button type="button" class="executeSearch">Search</button>
                                        </div>
                                    </div>
                                    <div class="search-list"></div>
                                </div>`);
        const domFunctions = new DOMFunctions();
        domFunctions.bindEventByClassName("click", "executeSearch", this.refreshSearchList.bind(this));
        domFunctions.bindEventByClassName("keyup", "searchString", this.setSearchString.bind(this));
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

{
    App.init();
}