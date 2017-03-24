var CallbackRegistry = {}; 

function JSONPHandler(url, onSuccess, onError) {
        var scriptOk = false;
        var callbackName = 'cb' + String(Math.random()).slice(-6);
        url += ~url.indexOf('?') ? '&' : '?';
        // client id should be read from configuration
        url += 'client_id=luqvyoa6utwz5evwsxo0tkjd3bdjk3&callback=CallbackRegistry.' + callbackName;

        CallbackRegistry[callbackName] = function(data) {
            scriptOk = true;
            delete CallbackRegistry[callbackName];
            onSuccess(data);
        };

        function checkCallback() {
            if (scriptOk) return;
            delete CallbackRegistry[callbackName];
            onError(url);
        }

        var script = document.createElement('script');

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