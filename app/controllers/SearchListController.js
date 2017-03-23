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
        this.searchString = ev.target.value;
    };

    SearchListController.prototype.renderTemplate = function(searchListViewHtml){
        var _this = this;
        var output = document.getElementById("applicationHost");
        output.innerHTML = output.innerHTML + searchListViewHtml;
        _this.getElementByClassName("executeSearch").addEventListener("click", _this.refreshSearchList.bind(_this));
        _this.getElementByClassName("searchString").addEventListener("keyup", _this.setSearchString.bind(_this));
    }

    return SearchListController;

})(BaseViewComponent || {});