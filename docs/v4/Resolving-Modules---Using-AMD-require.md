**[Browser Only]** Using the [AMD extension](https://github.com/losandes/hilaryjs/wiki/Referencing-Hilary-in-the-Browser#the-amd-extension), you can resolve modules according to the AMD spec.

> Also See [Using AMD define](https://github.com/losandes/hilaryjs/wiki/Registering-Modules-::-Using-AMD-define)

```JavaScript
require(function (require, exports, module) {
    var myModule = require('myModule'),
        myOtherModule = require('myOtherModule');
    
    console.log(myModule.message);
    console.log(myOtherModule.message);
});
```

Or:

```JavaScript
require(['myHilaryModule'], function (myHilaryModule) {
    myHilaryModule.go();
});
```