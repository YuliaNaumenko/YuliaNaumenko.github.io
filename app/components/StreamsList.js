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

})(BaseViewComponent || {});