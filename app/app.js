//= require app/controllers/SearchListController.js
//= require app/helpers/templateFetcher.js

var App = (function (app) {

  app.init = function () {
     TemplateFetcher.init();
     SearchListController.init();
  };
  
  return app;

})(App || {});

App.init();