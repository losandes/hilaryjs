describe("hilary", function() {
  var container,
      testModuleDefinitions;

  testModuleDefinitions = {
    empty: {
      name: 'foo',
      output: 'registered foo!'
    },
    emptyToo: {
      name: 'bar',
      output: 'registered bar!'
    }
  };

  beforeEach(function() {
    container = hilary.createContainer();
  });


  it('should exist in window', function() {
    expect(window.hilary).not.toBe(null);
  });

  it('should create new parent containers', function() {
    expect(container).not.toBe(null);
  });

  describe('hilary.register', function(){
    it('should register single modules by name', function() {
      container.register(testModuleDefinitions.empty.name, function() {
        return testModuleDefinitions.empty.output;
      });

      expect(container.resolve(testModuleDefinitions.empty.name)()).toBe(testModuleDefinitions.empty.output);
    });
  }); 

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
      container.createChildContainer().resolve(['$container', '$parentContainer'], function (ctnr, parent) {
        expect(ctnr).not.toBe(null);
        expect(ctnr.getContainer).not.toBe(null);
        expect(parent).not.toBe(null);
        expect(parent.getContainer).not.toBe(null);
      });
    });
  });

});
