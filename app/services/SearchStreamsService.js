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
