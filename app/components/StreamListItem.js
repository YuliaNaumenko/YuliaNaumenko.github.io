//= require app/components/BaseViewComponent.js

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

}(BaseViewComponent || {}));