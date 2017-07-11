Getting Started With Node.js
============================

* [Registering Modules](#registering-modules)
    * [Degrading to Node.js `require`](#degrading-to-nodejs-require)
    * [The Composition Root Pattern](#the-composition-root-pattern)
    * [Defining Objects & Primitives](#defining-objects--primitives)
    * [Defining Functions](#defining-functions)
    * [Defining Classes](#defining-classes)
    * [Defining Arrow Functions](#defining-arrow-functions)
    * [Importing Members](#importing-members)
    * [Async Registration](#async-registration)
* [Resolving Modules](#resolving-modules)
    * [Resolution Hierarchy](#resolution-hierarchy)
    * [When To Resolve](#when-to-resolve)
    * [Resolving in the Composition Root](#resolving-in-the-composition-root)
    * [Async Resolution](#async-resolution)
* [Bootstrapping Your App](#bootstrapping-your-app)
    * [Bootstrapping Your App With `hilary.bootstrap`](#bootstrapping-your-app-with-hilarybootstrap)
    * [Bootstrapping Your App With async.js](#bootstrapping-your-app-with-asyncjs)
* [Logging & Debugging](#logging--debugging)
    * [Log Levels](#log-levels)
    * [Customizing the Log Output](#customizing-the-log-output)
* [Disposing Modules](#disposing-modules)
* [Scopes](#scopes)


## Registering Modules

### Degrading to Node.js `require`
hilary gracefully degrades to `require` (specifically, `require.main.require`), so there is no need to register modules that can be `required` unless you are manipulating them. Because hilary uses `require.main.require`, file paths are resolvable as long as they are relative to your _main_ file (i.e. app.js / server.js).

To add the other modules in our application, and to avoid coupling our modules to the file structure, we can `register` them in hilary.

> For the complete resolution hierarchy, see [Resolving Modules](#resolving-modules).
>
> Note that if you import members, a singleton _is_ created. You'll find more information about how hilary uses singletons as you read on.

### The Composition Root Pattern
>A Composition Root is a (preferably) unique location in an application where modules are composed together.
>
> A DI Container should only be referenced from the Composition Root. All other modules should have no reference to the container.
>
> -- Mark Seemann
> http://blog.ploeh.dk/2011/07/28/CompositionRoot

To follow the composition root pattern, we can establish a convention for defining our modules. The recommended convention is to export from our modules, a `name`, and a `factory` at a minimum. In addition to those, hilary supports a `dependencies` array, and a `singleton` argument.

* **name** (required string): The name of the module (must be unique)
* **singleton** (boolean, default: true): When true (default), hilary will resolve the module's dependency graph _once-per-application-lifetime_. When false, hilary will resolve the module's dependency graph, each time it is resolved/depended upon.
* **dependencies** (array of strings / false): An array of module names / packages. Alternatively, if you are registering a function that has no dependencies, and should not be executed when being resolved, set this to `false`
* **factory** (primitive / object / function / class / arrow-function): the module, or constructor for initializing the module

Using this convention, our modules are not only decoupled from hilary, they can be composed, with, or without hilary.

```JavaScript
module.exports.name = 'myModule';
module.exports.singleton = true; // not required (default is true)
module.exports.dependencies = ['hello', 'world'];
module.exports.factory = function (hello, world) {
    // ...
}
```

> Note that, if all of your factory arguments match the names of the modules that are depended upon, the dependencies array can be omitted. hilary will resolve the dependencies, based on the argument names.

Assuming the example above is defined in a file, called, `myModule.js`, we can require it, and register it in our composition root using, `scope.register(require('./myModule.js'))`:

```JavaScript
// app.js
// given that scope is `hilary` or hilary.scope('myScope')
scope.register(myModule);
```

#### Registering Arrays of Modules
Registering each module can be verbose, and cause a lot of merge conflicts. To reduce thrashing of our composition root file, hilary supports registering arrays of modules.

In this example, we'll use Node.js' `index` loading behavior to register our modules. Once we register the index, we can add new modules to `index.js` each time we author a new module, instead of modifying our composition root.

```JavaScript
// /numbers/module1.js
module.exports.name = 'module1';
module.exports.factory = 42;
```

```JavaScript
// /numbers/module2.js
module.exports.name = 'module2';
module.exports.factory = 43;
```

```JavaScript
// /numbers/index.js
module.exports = [
    require('./module1.js'),
    require('./module2.js')
];
```

Finally, we can register our index using, `scope.register(require('./numbers'))`:
```JavaScript
// app.js
// given that scope is `hilary` or hilary.scope('myScope')
scope.register(numbers);
```

### Defining Objects & Primitives
When registering objects and primitives, there can be no dependencies, singleton has no meaning, and we can expect the value to be returned, any time it is depended upon.

```JavaScript
module.exports.name = 'myObject';
module.exports.factory = {
    question: 'What is the answer to the Ultimate Question of Life, The Universe, and Everything?'
    answer: 42
};
```

```JavaScript
module.exports.name = 'myNumber';
module.exports.factory = 42;
```

```JavaScript
module.exports.name = 'myBoolean';
module.exports.factory = true;
```

```JavaScript
module.exports.name = 'myArray';
module.exports.factory = [1,2,3];
```

### Defining Functions
Functions can perform work, and depend on other modules. By default, functions are treated as singletons: the result of executing them is stored, and reused for subsequent dependencies.

#### Simple Example
Here's a module that prints a question to the console, and compares your answers until you get it right.
```JavaScript
module.exports.name = 'myModule';
module.exports.factory = function () {
    start();

    function start() {
        ask();
        waitForAnswer();
    }

    function ask () {
        console.log('What is the answer to the Ultimate Question of Life, The Universe, and Everything?');

    }

    function waitForAnswer () {
        process.stdin.once("data", function (data) {
            if (test(data.toString().trim())) {
                console.log('Correct!');
                process.exit(0);
            } else {
                console.log('Sorry, try again!');
                waitForAnswer();
            }
        });
    }

    function test (answer) {
        return answer === '42';
    }
};
```

#### Composable Example
What if we wanted to ask random questions? In the following example, we break the example above into modules, so it is extensible.

> You can see this example in action, in the [examples](https://github.com/losandes/hilaryjs/tree/master/examples/q-and-a-node-functions)

First, we'll create a printer interface (this could be swapped out with something else later, if desired):
```JavaScript
module.exports.name = 'printer';
module.exports.factory = {
    print: console.log
};
```

Next, we'll create a module that listens for our answer, and checks to see if we got it right:
```JavaScript
module.exports.name = 'listener';
module.exports.factory = {
    listen: listen
};

function listen (answer) {
    process.stdin.once('data', function (data) {
        test(data.toString().trim(), answer);
    });
}

function test (input, answer) {
    if (input === answer) {
        console.log('Correct!');
        process.exit(0);
    } else {
        console.log('Sorry, try again!');
        listen(answer);
    }
}
```

We'll create a question object that executes the Q & A:
```JavaScript
module.exports.name = 'question';
module.exports.dependencies = ['printer', 'listener'];
module.exports.factory = function (printer, listener) {
    return {
        ask: function (question, answer) {
            printer.print(question);
            listener.listen(answer);
        }
    };
};
```

We'll add these modules to an `index.js`:
```JavaScript
module.exports = [
    require('./listener.js'),
    require('./printer.js'),
    require('./Question.js')
];
```

We need some questions (note these aren't a hilary module):
```JavaScript
module.exports = [
    { q: 'What is 0+1?', a: '1' },
    { q: 'What is 1+1?', a: '2' },
    { q: 'What is 2+1?', a: '3' },
    { q: 'What is 3+2?', a: '5' }
];
```

Finally, we'll compose our dependency graph, and ask a Question:
```JavaScript
var scope = require('hilary').scope('myApp'),
    qAndA = require('./q-and-a'),
    questions = require('./questions.js');

scope.bootstrap([
    scope.makeRegistrationTask(qAndA)
], function (err, scope) {
    if (err) {
        throw err;
    }

    var question = scope.resolve('question'),
        selected = questions[Math.floor(Math.random() * questions.length)];

    question.ask(selected.q, selected.a);
});
```

We can even compose our app, without hilary:

```JavaScript
var listener = require('./q-and-a/listener.js'),
    printer = require('./q-and-a/printer.js'),
    Question = require('./q-and-a/question.js'),
    questions = require('./questions.js');

var question = new Question.factory(printer.factory, listener.factory),
    selected = questions[Math.floor(Math.random() * questions.length)];

question.ask(selected.q, selected.a);

```

> Notice that in this example, the _poor man's DI_ is simpler than using hilary. A general rule of thumb that I use is not to use an IoC container if my app is less than ~20 modules. We can always start with _poor mans DI_, using the convention in this documentation, and choose to add an IoC container later, if the app gets big enough.

### Defining Classes
hilary supports using classes as well. Riffing on the examples above, the Question module would looke like this:

```JavaScript
module.exports.name = 'Question';
module.exports.dependencies = ['printer', 'Listener'];
module.exports.factory = class {

    constructor(printer, Listener) {
        this.printer = printer;
        this.Listener = Listener;
    }

    ask (question, answer) {
        this.printer.print(question);
        new this.Listener(answer).listen();
    }

};
```

### Defining Arrow Functions
We can also use arrow functions (lambda expressions) to define our modules"

```JavaScript
module.exports.name = 'question';
module.exports.dependencies = ['printer', 'listener'];
module.exports.factory = (printer, listener) => {
    return function (question, answer) {
        return {
            ask: function () {
                printer.print(question);
                listener(answer).listen();
            }
        };
    };
};
```

### Importing Members
If we want to depend, only on a subset of the members (properties), that a given interface exports, the syntax is similar to that of ES6 imports, and supports aliasing.

Let's say we have a module that exports three properties: `one`, `two`, and `three`
```JavaScript
module.exports.name = 'something';
module.exports.factory = {
    one: 'one',
    two: 'two',
    three: 'three'
};
```

Another module can depend on only the properties it needs, aliasing them, if desired. In this example, we alias `one` as, `uno`, and also depend on `two`:
```JavaScript
module.exports.name = 'somethingElse';
module.exports.dependencies = ['something { one as uno, two }'];
module.exports.factory = function (something) {
    console.log(something.uno);     // prints 'one'
    console.log(something.two);     // prints 'two'
    console.log(something.one);     // prints undefined
    console.log(something.three);   // prints undefined
};
```

### Async Registration
`register` can be called synchronously, or asynchronously. Just add a callback for async behavior:

```JavaScript
// given that scope is `hilary` or hilary.scope('myScope')
scope.register('qAndA', function (err, result) {
    if (err) {
        console.log(err);
        return;
    }
    // ...
});
```


## Resolving Modules

### Resolution Hierarchy
hilary attempts to resolve modules, based on the following flow diagram:

<img src="https://user-images.githubusercontent.com/933621/28041618-23cd3c82-6598-11e7-95bb-09919d5e94ab.png" alt="a flow diagram of the hilary resolution hierarchy (a text representation follows)" height="500" />

1. If a singleton exists, it is returned
2. Otherwise, if a module is registered, it is resolved, and returned
3. Otherwise, if a parent scope is present, hilary attempts to resolve via the parent scope (back to step 1)
4. Otherwise, hilary degrades to `require`

#### Degrading to Node.js `require`
Specifically, hilary gracefully degrades to `require.main.require`, so there is no need to register modules that can be `required` unless you are manipulating them. File paths are resolvable as long as they are relative to your _main_ file (i.e. app.js / server.js).

Let's say we want to depend on the `http` library that comes with Node.js. There is no need to register it, we can simply depend on it:

```JavaScript
module.exports.name = 'www';
module.exports.dependencies = ['http'];
module.exports.factory = function (http) {
    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello World\n');
    }).listen(3000, '127.0.0.1');

    console.log('Server running at http://127.0.0.1:3000/');

    return http;    
};
```

### When To Resolve
When we resolve a module, hilary attempts to satisfy it's dependencies. If those dependencies are not yet registered, resolution will fail. So the best time to resolve a module is _at the last possible moment_, or simply, _after all of the modules are registered_.

hilary has a [Bootstrapper](#bootstrapping-your-app) to help make this clear, and the bootstrapper, or [Composition Root](http://blog.ploeh.dk/2011/07/28/CompositionRoot) is the only place where we should resolve modules.

### Resolving in the Composition Root
If we look at the example in [Registering Modules - composable example](#composable-example), we can see that we resolve the `question` module in the final callback of our `bootstrap` method:
```JavaScript
// given that scope is `hilary` or hilary.scope('myScope')
scope.resolve('question');
```

When we call resolve, hilary recurses through the dependency graph, to satisfy all of the dependencies that are needed to return the result of executing the `question` module. In this case it's just one plane that needs to be resolved:

```
question
  |__printer
  |__listener
```

Let's say that `printer` depended on a specific printer implementation instead of using `console` directly:

```JavaScript
module.exports.name = 'printer';
module.exports.dependencies = ['someOtherOutput'];
module.exports.factory = function (output) {
    return {
        print: function () {
            output.write(arguments);
        }
    };
};
```

Then, when we call `scope.resolve('question');`, the dependency graph would look like this:
```
question
  |__printer
    |__someOtherOutput
  |__listener
```

### Async Resolution
`resolve` can be called synchronously, or asynchronously. Just add a callback for async behavior:

```JavaScript
// given that scope is `hilary` or hilary.scope('myScope')
scope.resolve('question', function (err, question) {
    if (err) {
        console.log(err);
        return;
    }

    var selected = questions[Math.floor(Math.random() * questions.length)];
    question.ask(selected.q, selected.a);
});
```

### Checking to see if a module exists

You can check to see if a module exists using `exists`, which returns a boolean: true if the modules exists, otherwise false.

```JavaScript
// given that scope is `hilary` or hilary.scope('myScope')
scope.exists('myModule');
```


## Bootstrapping Your App

### Bootstrapping Your App With `hilary.bootstrap`
The `bootstrap` method on `hilary` can be used to organize the composition of your app. If you are familiar with [async.js](https://github.com/caolan/async), `bootstrap` may look familiar to you: it's a waterfall. As with async's waterfall, the `bootstrap`

> Runs the tasks array of functions in series, each passing their results to the next in the array. However, if any of the tasks pass an error to their own callback, the next function is not executed, and the main callback is immediately called with the error.
> -- https://caolan.github.io/async/docs.html#waterfall

Let's say that we have an app with the following structure, and that each folder has an `index.js` with an array of modules:

```
app
  |__endpoints
  |__books
  |__movies
  |__music
  |__users
```

Assuming a module named, `endpoints-start`, will start our app, and that we're connecting to an instance of MongoDB, our bootstrapper might look like this:

```JavaScript
var scope = require('hilary').scope('myApp'),
    MongoClient = require('mongodb').MongoClient,
    url = 'mongodb://localhost:27017/test';

scope.bootstrap([
    // register all of the modules
    scope.makeRegistrationTask(require('./endpoints')),
    scope.makeRegistrationTask(require('./books')),
    scope.makeRegistrationTask(require('./movies')),
    scope.makeRegistrationTask(require('./music')),
    scope.makeRegistrationTask(require('./users')),
    // connect to the database, and register a `db` module
    function (scope, next) {
        MongoClient.connect(url, function (err, db) {
            if (err) {
                return next(err);
            }

            scope.register({
                name: 'db',
                dependencies: false,
                factory: db
            });

            next(null, scope);
        });
    }
], function (err, scope) {
    // finally

    if (err) {
        throw err;
    }

    // start the app
    scope.resolve('endpoints-start');
});
```

`makeRegistrationTask` is a convenience method that we can use to queue the modules we need to register before starting our app. The last function in the array provides an another kind of example, where we need to perform some work before continuing. After connecting to the database, we register `db`, so modules can depend on this single connection. Finally, we start our app by resolving modules, in this case, `endpoints-start`.

> Note that `makeRegistrationTask` assumes it is receiving exactly one argument, `scope`, from the previous task. For this reason, it's a best practice to always place these at the beginning of the array, so the signature is guaranteed.

### Bootstrapping Your App With async.js
If you plan to use async.js anyway, it can also be used to bootstrap your app. Here's what the bootstrapper from above might look like, using async:

```JavaScript
var scope = require('hilary').scope('myApp'),
    async = require('async'),
    MongoClient = require('mongodb').MongoClient,
    url = 'mongodb://localhost:27017/test';

async.parallel([
    // register all of the modules
    function (next) {
        scope.register(require('./endpoints'), next);
    },
    function (result, next) {
        scope.register(require('./books'), next);
    },
    function (result, next) {
        scope.register(require('./movies'), next);
    },
    function (result, next) {
        scope.register(require('./music'), next);
    },
    function (result, next) {
        scope.register(require('./users'), next);
    },
    // connect to the database, and register a `db` module
    function (result, next) {
        MongoClient.connect(url, function (err, db) {
            if (err) {
                return next(err);
            }

            scope.register({
                name: 'db',
                dependencies: false,
                factory: db
            });

            next(null);
        });
    }
], function (err) {
    // finally

    if (err) {
        throw err;
    }

    // start the app
    scope.resolve('endpoints-start');
});

function makeRegistrationTask (moduleOrArray) {
    return function (scope, done) {
        scope.register(moduleOrArray, function (err) {
            if (err) {
                return done(err);
            }

            done(null, scope);
        });
    };
}
```

> Note that this example takes advantage of async's `parallel` function. If we make sure not to resolve anything before the callback, then it should be safe for our registration array to execute in any order.


## Logging & Debugging

### Log Levels
hilary produces logs to help you understand it's behavior, and what might be failing. You can choose the verbosity of these logs. The default level is `info`. The following levels are supported:

* **trace** (10): _very verbose_; prints detailed information about what hilary is doing
* **debug** (20): _verbose_; prints high-level information about what hilary is doing
* **info** (30): not used currently
* **warn** (40): prints warnings, such as things you might be doing that won't break hilary, but are not a best practice
* **error** (50): prints errors that occur
* **fatal** (60): prints errors that would keep hilary from completing more than one task (i.e. if the bootstrapper can't continue)
* **off** (70): turns all logging off

To set the log level for your application, pass an object in as the second argument for your scope. hilary will print anything that occurrs that the log level you choose, or above. For instance, by setting the log level to _trace_, hilary will print everything. By setting it to _error_, it will not print _trace_, _debug_, _info_, or _warn_ logs.

```JavaScript
hilary.scope('myScope', {
    logging: {
        level: 'trace'
    }
});
```

### Customizing the Log Output
By default, hilary prints it's logs to the console. That might not be ideal for you, so you can inject a _printer_, or a _logger_ of your choosing. What's the difference?

* **printer**: accepts an `entry` object. You might choose to do this if you if you want to leverage a log utility, instead of printing the logs to the console.
* **log**: accepts a first argument of `level`, followed by an `entry` object. You might choose to use this if you if you want to choose how to handle logs, based on their level. For instance, this is appropriate if you want to leverage a log utility, instead of printing the logs to the console, AND to send notifications when logs exceed a given threshold.

> All `entry` objects have a `message` property. They are otherwise dynamic, and may or may not include other properties. If you require a string format, we recommend using `JSON.stringify` in your _printer_ or _logger_.

Here's an example of injecting a _printer_ ([also in the examples](../examples/logger-inject-printer)):

```JavaScript
var hilary = require('hilary'),
    scope = hilary.scope('myApp', {
        logging: {
            level: 'trace',
            printer: function (entry) {
                console.log('MY PRINTER', entry);
            }
        }
    });

scope.register({
    name: 'foo',
    factory: 42
});
```

And an example of injecting a _logger_:

```JavaScript
var hilary = require('hilary'),
    scope = hilary.scope('myApp', {
        logging: {
            level: 'trace',
            log: function (level, entry) {
                if (level < 10 || level === 70) {
                    return;
                }

                switch(level) {
                    case 60:
                        console.log('[FATAL]', entry);
                        break;
                    case 50:
                        console.log('[ERROR]', entry);
                        break;
                    case 40:
                        console.log('[WARN]', entry);
                        break;
                    case 30:
                        console.log('[INFO]', entry);
                        break;
                    case 20:
                        console.log('[DEBUG]', entry);
                        break;
                    case 10:
                        console.log('[TRACE]', entry);
                        break;
                    default:
                        console.log(entry);
                        break;
                }
            }
        }
    });

scope.register({
    name: 'foo',
    factory: 42
});
```
