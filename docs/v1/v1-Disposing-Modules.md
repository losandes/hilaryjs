You can dispose modules, or even the entire container. Consider using different scopes, such as new Hilary instances or child containers if you are doing a lot of disposing. Then you can just delete the scope when you are finished with it.

```JavaScript
// dispose a single module
scope.dispose('myModule');

// dispose multiple modules
scope.dispose(['myModule', 'myOtherModule']);

// dispose all modules on the container
scope.dispose();
```