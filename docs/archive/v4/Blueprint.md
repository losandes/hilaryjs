Blueprint
==========

Blueprint is a tool to support control of polymorphism in JavaScript. It's kind of like an interface in a strongly typed language like C# or Java. Creating a Blueprint is simple. The following example demonstrates all of the types that are supported in Blueprint.

```JavaScript
var IFoo = new Hilary.Blueprint({
    num: 'number',
    str: 'string',
    arr: 'array',
    currency: 'money',
    bool: 'bool',
    date: 'datetime',
    regex: 'regexp',
    obj: 'object',
    func: {
        type: 'function',
        args: ['arg1', 'arg2']
    },
    dec: {
        type: 'decimal',
        places: 2
    },
    nullable: {
        type: 'string',
        required: false
    },
    custom: {
        validate: function (val, errors, self) {
            if (val !== 42) {
                errors.push('custom must be 42');
            }            
        }
    }
});
```

With the Blueprint above, we can check to see if a given object's signature matches the blueprint:

```JavaScript
var foo = {
    num: 42,
    str: 'string',
    arr: [],
    currency: '42.42',
    bool: true,
    date: new Date(),
    regex: /[A-B]/,
    obj: {
        foo: 'bar'
    },
    func: function (arg1, arg2) {},
    dec: 42.42,
    custom: 42
};

IFoo.signatureMatches(foo, function (err, result) {
    if (err) {
        throw new Error('foo does not implement IFoo!');
    }
    
    // do something with foo
});
```

### Blueprint Inheritance
Blueprints can inherit other Blueprints

```JavaScript
var IFoo,
    IFooBar;

// IFoo requires the "name" property, which must be a string
IFoo = new Hilary.Blueprint({
    name: 'string'
});

// IFooBar requires the "description" property, which must be a string
IFooBar = new Hilary.Blueprint({
    description: 'string'
});

// IFooBar now requires the "name" and "description" properties, which must be strings
IFooBar.inherits(IFoo);
```


## Custom Validation
You can override the Blueprint validation for any property by setting the value of that property to an object literal with a validation function on it. The validation function receives three arguments:

* **propertyValue**: The value of the implementation property that matches on property name
* **errorArray** (array): If your validation encounters any errors, they need to be pushed into this array. If the array is empty, validation passes, if it has any values, validation returns false.
* **implementation**: The implementation that is being validated against the blueprint. This is supplied so you can validate across properties if necessary.

```JavaScript
var ICustomFoo = new Hilary.Blueprint({
    name: 'string',
    doSomething: {
        type: 'function',
        args: ['arg1', 'arg2']
    },
    meaningOfLife: {
        validate: function (meaningOfLife, errorArray, superComputer) {
            if (superComputer.isReady && meaningOfLife !== 42) {
                errorArray.push('Sorry, that is not the answer to the meaning of life, the universe and everything');
            }
        }
    }
});
```

The validate function accepts two arguments. The first argument is the property on the implementation that matches the name of the property that is doing the validation. The second argument is the error array. If you push a message into the error array, it will be passed to the ``callback`` of the ``signatureMatches`` function, in the first parameter, and the result of ``signatureMatches`` will be ``false``. If your validation is truthy, take no action.

## Nullable Properties
One great use for Blueprints is to validate a payload coming from a client, or to validate options being passed into a constructor. Sometimes, we don't require a property but would like to validate the property if a value is assigned. That's where the `required` argument comes in. 

Any property can be nullable by setting `required` to `false`. When this is so, the argument will be ignored when it is `null` or `undefined`. When the argument has a value, that value will be validated appropriately.

## Nested Blueprints
If a property of your Blueprint should implement another Blueprint, you can register the blueprint as such:

```JavaScript
var INestedFoo = new Hilary.Blueprint({
    name: 'string',
    doSomething: {
        type: 'function',
        args: ['arg1', 'arg2']
    },
    implementsSomething: {
        type: 'blueprint',
        blueprint: new Hilary.Blueprint({
            name: 'string',
            description: 'string'
        })
    }
});
```

## Synchronous validation
Sometimes, async introduces complexity without real benefit. If you find yourself in that situation, you can use ``syncSignatureMatches``.

```JavaScript
var foo,
    sigMatchResult;

foo = {
    num: 42,
    str: 'string',
    arr: [],
    currency: '42.42',
    bool: true,
    date: new Date(),
    regex: /[A-B]/,
    obj: {
        foo: 'bar'
    },
    func: function (arg1, arg2) {},
    dec: 42.42
};

sigMatchResult = IFoo.syncSignatureMatches(foo);

if (sigMatchResult.result !== true) {
    console.log(sigMatchResult.errors);
}
```

## Batch validation
When you register modules with blueprints, Hilary keeps track of them, so you can validate their adherance to blueprints all at once.

```JavaScript
scope.validateBlueprints();

// OR

scope.validateBlueprintsAsync(function (err, result) {
    console.log(result, err);
});
```
