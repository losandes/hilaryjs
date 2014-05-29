describe("hilary", function() {
  var container,
      testModuleDefinitions = {
              empty: {
                name: 'foo',
                output: 'registered foo!'
              },
              emptyToo: {
                name: 'bar',
                output: 'registered bar!'
              }
            },
      constants = {
                container: 'hilary::container',
                parentContainer: 'hilary::parent',
                beforeRegister: 'hilary::before::register',
                afterRegister: 'hilary::after::register',
                beforeResolve: 'hilary::before::resolve',
                afterResolve: 'hilary::after::resolve',
                beforeNewChild: 'hilary::before::new::child',
                afterNewChild: 'hilary::after::new::child'
            };;

  window.externalWindowComponent1 = function() { return 'externalWindowComponent1'; };
  window.externalWindowComponent2 = function() { return 'externalWindowComponent2'; };

  beforeEach(function() {
    container = hilary.createContainer();
  });

  describe('hilary.ctor', function(){

    it('should exist in window', function() {
      expect(window.hilary).toBeDefined();
    });


    it('should create new parent containers', function() {
      expect(container).toBeDefined();
    });


    it('should create child containers', function() {
      var _child = container.createChildContainer();

      container.register(testModuleDefinitions.empty.name, function() {
        return testModuleDefinitions.empty.output;
      });

      _child.register(testModuleDefinitions.emptyToo.name, function() {
        return testModuleDefinitions.emptyToo.output;
      });

      var shouldThrow = function () {
        return container.resolve(testModuleDefinitions.emptyToo.name);
      };

      expect(container.resolve(testModuleDefinitions.empty.name)()).toBe(testModuleDefinitions.empty.output);
      expect(_child.resolve(testModuleDefinitions.emptyToo.name)()).toBe(testModuleDefinitions.emptyToo.output);
      expect(shouldThrow).toThrow();
    });
  }); // / ctor

  describe('hilary.register', function(){

    it('should register single modules by name', function() {
      container.register(testModuleDefinitions.empty.name, function() {
        return testModuleDefinitions.empty.output;
      });

      expect(container.resolve(testModuleDefinitions.empty.name)()).toBe(testModuleDefinitions.empty.output);
    });


    it('should register any number of modules by func', function() {
      container.register(function(cntr) {
        cntr.hello = function() { return 'world' };
        cntr.ola = function() { return 'el mundo' };
      });

      expect(container.resolve('hello')()).toBe('world');
      expect(container.resolve('ola')()).toBe('el mundo');
    });

  }); // /register

  describe('hilary.resolve', function(){

    it('should resolve single modules by name', function() {
      container.register(testModuleDefinitions.empty.name, function() {
        return testModuleDefinitions.empty.output;
      });

      expect(container.resolve(testModuleDefinitions.empty.name)()).toBe(testModuleDefinitions.empty.output);
    });


    it('should resolve multiple modules by name', function() {
      container.register(testModuleDefinitions.empty.name, function() {
        return testModuleDefinitions.empty.output;
      });

      container.register(testModuleDefinitions.emptyToo.name, function() {
        return testModuleDefinitions.emptyToo.output;
      });

      container.resolve([testModuleDefinitions.empty.name, testModuleDefinitions.emptyToo.name], function (foo, bar) {
        expect(foo()).toBe(testModuleDefinitions.empty.output);
        expect(bar()).toBe(testModuleDefinitions.emptyToo.output);
      });
    });


    it('should resolve container and parentContainer modules by name', function() {
      container.createChildContainer().resolve([constants.container, constants.parentContainer], function (ctnr, parent) {
        expect(ctnr).not.toBe(null);
        expect(ctnr.getContainer).not.toBe(null);
        expect(parent).not.toBe(null);
        expect(parent.getContainer).not.toBe(null);
      });
    });


    it('should resolve through parent hierarchy', function() {
      var _child = container.createChildContainer();
      var _grandChild = _child.createChildContainer();

      container.register(testModuleDefinitions.empty.name, function() {
        return testModuleDefinitions.empty.output;
      });

      _child.register(testModuleDefinitions.emptyToo.name, function() {
        return testModuleDefinitions.emptyToo.output;
      });

      expect(_grandChild.resolve(testModuleDefinitions.empty.name)()).toBe(testModuleDefinitions.empty.output);
      expect(_grandChild.resolve(testModuleDefinitions.emptyToo.name)()).toBe(testModuleDefinitions.emptyToo.output);
    });

  }); // /resolve

  describe('hilary.pipeline', function() {

    it('should allow injection for before register', function() {
      container.register(constants.beforeRegister, function(cntr, moduleNameOrFunc, moduleDefinition) {
        cntr.fooB4Register = function() { return { name: moduleNameOrFunc, definition: moduleDefinition }; }
      });

      container.register(testModuleDefinitions.empty.name, function() {
        return testModuleDefinitions.empty.output;
      });

      expect(container.resolve('fooB4Register')().name).toBe(testModuleDefinitions.empty.name);
    });


    it('should allow injection for after register', function() {
      container.register(constants.afterRegister, function(cntr, moduleNameOrFunc, moduleDefinition) {
        cntr.fooAfterRegister = function() { return { name: moduleNameOrFunc, definition: moduleDefinition }; }
      });

      container.register(testModuleDefinitions.empty.name, function() {
        return testModuleDefinitions.empty.output;
      });

      expect(container.resolve('fooAfterRegister')().name).toBe(testModuleDefinitions.empty.name);      
    });


    it('should allow injection for before resolve', function() {
      container.register(constants.beforeResolve, function(cntr, moduleNameOrDependencies, callback) {
        cntr.fooB4Resolve = function() { return 'resolving!'; }
      });

      container.register(testModuleDefinitions.empty.name, function() {
        return testModuleDefinitions.empty.output;
      });

      container.resolve([constants.container, testModuleDefinitions.empty.name], function(cntr, foo) {
        expect(cntr.fooB4Resolve()).toBe('resolving!'); 
      });
    });


    it('should allow injection for after resolve', function() {
      container.register(constants.afterResolve, function(cntr, moduleNameOrDependencies, callback) {
        cntr.fooB4Resolve = function() { return moduleNameOrDependencies; }
      });

      container.register(testModuleDefinitions.empty.name, function() {
        return testModuleDefinitions.empty.output;
      });

      container.register(testModuleDefinitions.empty.name, function() {
        return testModuleDefinitions.empty.output;
      });

      expect(container.resolve(testModuleDefinitions.empty.name)()).toBe(testModuleDefinitions.empty.output);

      container.resolve([constants.container], function(cntr) {
        expect(cntr.fooB4Resolve()).toBe(testModuleDefinitions.empty.name); 
      });
    });


    it('should allow injection for before create child', function() {
      container.register(constants.beforeNewChild, function() {
          // TODO
      });
    });


    it('should allow injection for after create child', function() {
      // TODO
    });

  });

});
