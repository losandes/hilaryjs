Building hilary.js
========

* If you list the dependencies as devDependencies in the package.json, npm will enter an infinite loop.
* Sometimes, when running ``npm install``, ``grunt-mocha-test`` does not install properly. To fix this, manually uninstall and reinstall ``grunt-mocha-test``

```
> npm uninstall grunt-mocha-test
...
> npm install grunt-mocha-test
```

Once your dependencies are installed, the following commands can be used to build and test Hilary:

* The following will minify Hilary, then execute both the browser and node tests, and then copy the output into the example folders:
```
> grunt
```

* The following will just execute the node tests:
```
> grunt testnode
```

* The following will minify Hilary, and execute the browser tests
```
> grunt testbrowser
```

