//= require app/helpers/JSONPHandler.js
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

    SearchStreamService.prototype.getStreamCollection = function (searchString, fnCallback, offset, limit) {
        var url = "https://api.twitch.tv/kraken/search/streams?query=";
        url += encodeURIComponent(searchString);
        if (typeof (offset) === "number") {
            url += '&offset=' + offset;
        }
        if (typeof (limit) === "number" && limit > 0) {
            url += '&limit=' + limit;
        }
        else {
            url += '&limit=5';            
        }
        this.fnCallback = fnCallback;
        this.jsonpHandler.load(url, this.parseResult, this.errorHandler);
    }

    SearchStreamService.prototype.errorHandler = function(result) {
        console.error(result);
    };

	return SearchStreamService;
}(SearchStreamService || {}));
