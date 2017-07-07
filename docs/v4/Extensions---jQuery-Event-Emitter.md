Hilary has a jQuery Event Emitter extension, which you can add by including the script.

```HTML
<script src="hilary.jQueryEventEmitter.min.js"></script>
```

This extension will automatically trigger all supported Hilary events on document, which you can bind to.

```JavaScript
$(document).on('hilary::before::register', function (event, data) {
    console.log(data.scope);
    console.log(data.moduleName);
    console.log(data.moduleDefinition);
});

$(document).on('hilary::after::register', function (event, data) {
    console.log(data.scope);
    console.log(data.moduleName);
    console.log(data.moduleDefinition);
});

$(document).on('hilary::before::resolve', function (event, data) {
    console.log(data.scope);
    console.log(data.moduleName);
});

$(document).on('hilary::after::resolve', function (event, data) {
    console.log(data.scope);
    console.log(data.moduleName);
    console.log(data.result);
});

$(document).on('hilary::before::new::child', function (event, data) {
    console.log(data.scope);
    console.log(data.options);
});

$(document).on('hilary::after::new::child', function (event, data) {
    console.log(data.scope);
    console.log(data.options);
    console.log(data.child);
});
```