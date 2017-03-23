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
}());