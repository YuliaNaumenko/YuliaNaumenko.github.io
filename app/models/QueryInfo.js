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