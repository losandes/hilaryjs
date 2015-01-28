/*jslint plusplus: true*/
/*globals require, console*/
(function () {
    "use strict";

    var fs = require('fs-extra'),
        uglify = require('uglify-js'),
        jsDir = "../src/",
        jsFiles = ["hilary"],
        jsFilesCount = jsFiles.length,
        ensureFileErr,
        keepGoing = true,
        i;
    
    ensureFileErr = function (err) {
        if (err) {
            keepGoing = false;
            console.log(err);
        }
    };
    
    for (i = 0; i < jsFilesCount; i++) {
        if (keepGoing) {
            var file = jsDir + jsFiles[i] + ".js",
                min = jsDir + jsFiles[i] + ".min.js",
                minified = uglify.minify(file);
            
            fs.ensureFileSync(min, ensureFileErr);
            fs.writeFileSync(min, minified.code);
        } else {
            break;
        }
    }
    
//    if (keepGoing) {
//        fs.copy('./src', './examples/node-web/public/scripts', function (err) {
//            if (err) {
//                return console.error(err);
//            }
//
//            console.log("build complete");
//        }); //copies directory, even if it has subdirectories or files    
//    }

}());
