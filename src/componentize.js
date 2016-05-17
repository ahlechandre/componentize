/**
 * Componentize.js - A handler for register and upgrade components dynamically.
 * The design pattern is inspired (in parts) by the Google (MDL) componentHandler.
 * 
 * @author Alexandre Thebaldi <ahlechandre@gmail.com>
 * @version v0.1.0
 */

// Module interface.
var Componentize = {
  /**
   * The data config to register a component.
   * 
   * @typedef {{
   *  constructor: function,
   *  name: string | undefined,
   *  cssClass: string,
   * }}
   */
  ComponentConfig: {},

  /**
   * Registers a specific component for future use.
   * 
   * @param {Componentize.ComponentConfig}
   */
  register: function (config) { },

  /**
   * Upgrade a specific instance of a registered component.
   * 
   * @param {HTMLElement}
   */
  upgradeElement: function (element) { },

  /**
   * Upgrade a given component and make it created.
   * 
   * @param {Componentize.ComponentConfig.cssClass}
   */
  upgrade: function (cssClass) { },

  /**
   * Upgrade all registered components and makes them created.
   * 
   */
  upgradeAll: function () { },

  /**
   * Apply the downgrade process on specific instance of a created component.
   * 
   * @param {HTMLElement}
   */
  downgradeElement: function (element) { },

  /**
   * Apply the downgrade process on a given created component.
   * 
   * @param {Componentize.ComponentConfig.cssClass}
   */
  downgrade: function (cssClass) { },

  /**
   * Apply the downgrade process on all created components.
   * 
   */
  downgradeAll: function () { },

  /**
   * Returns all registered components.
   * 
   * @return {array<Componentize.ComponentConfig> | array}
   */
  getAllRegistered: function () { },

  /**
   * Returns all created components.
   * 
   * @return {array<object> | array}
   */
  getAllCreated: function () { },
};

Componentize = (function () {

  /**
   * Stories the css classes used by this module. 
   * 
   */
  var _cssClasses = {};

  /**
   * Stories the constant strings used by this module. 
   * 
   */
  var _constants = {
    MESSAGE_ERROR_CONFIG: 'Please, provide a valid data config for component.',
    INSTANCE_CONFIG_PROP: '_ComponentConfig',
    DATASET_UPGRADED: 'upgraded-components',
  };

  /**
   * Stories all registered (data config) components. 
   * 
   * @type {array<Componentize.ComponentConfig>}
   */
  var _registeredComponents = [];

  /**
   * Stories all instances of created components. 
   * 
   * @type {array<object>}
   */
  var _createdComponents = [];

  /**
   * Upgrade internally a given registered component.
   * 
   * @param {Componentize.ComponentConfig}
   */
  var _upgradeInternal = function (registered) {
    var elements = document.querySelectorAll('.' + registered.cssClass);
    var i;

    for (i = 0; i < elements.length; i++) {
      _upgradeElementInternal(elements[i], registered);
    }
  };

  /**
   * Upgrade internally a specific element of a registered component.
   * 
   * @param {HTMLElement} element
   * @param {Componentize.ComponentConfig} componentConfig
   */
  var _upgradeElementInternal = function (element, componentConfig) {
    var instance /** @type {object} */;
    var componentList = [];

    if (!element.classList.contains(componentConfig.cssClass)) {
      console.warn('The element does not contain the defined class "' + componentConfig.cssClass + '"');
      return;
    }

    // Check if the element is already upgraded.
    if (_isUpgradedElement(element, componentConfig.name)) return;

    componentList = _getComponentList(element);
    componentList.push(componentConfig.name);
    instance = new componentConfig.constructor(element);
    // Injecting the element inside the instance by default.
    instance['element'] = element;
    // Stories the data config in component instance.
    instance[_constants.INSTANCE_CONFIG_PROP] = componentConfig;
    // Stories the component instance in element. 
    element[componentConfig.name] = instance;
    // Stories the all components from element in a dataset attribute.
    element.setAttribute('data-' + _constants.DATASET_UPGRADED, componentList.join(','));
    _createdComponents.push(instance);
  };

  /**
   * Returns the component list of a given element.
   * 
   * @param {HTMLElement} element 
   * @return {array}
   */
  var _getComponentList = function (element) {
    var componentList = [];
    var cssClasses = element.classList;
    var component;
    var i;

    cssClasses.forEach(function (cssClass) {

      for (i = 0; i < _createdComponents.length; i++) {
        component = _createdComponents[i];

        if (componentList.indexOf(component[_constants.INSTANCE_CONFIG_PROP].name) === -1 &&
          (component.element === element))
          componentList.push(component[_constants.INSTANCE_CONFIG_PROP].name);
      }
    });

    return componentList;
  };

  /**
   * Verifies if a given element is already upgraded for component.
   *
   * @param {HTMLElement} element 
   * @param {Componentize.ComponentConfig.name} componentName 
   * @return {boolean}
   */
  var _isUpgradedElement = function (element, componentName) {
    var upgradeds = element.getAttribute('data-' + _constants.DATASET_UPGRADED);

    // The dataset attribute was not defined.
    if (!upgradeds) return false;

    return (upgradeds.indexOf(componentName) !== -1);
  };

  /**
   * Returns the registered component referred to css class.
   * 
   * @param {Componentize.ComponentConfig.cssClass} cssClass
   * @return {Componentize.ComponentConfig | null}
   */
  var _getRegisteredByClass = function (cssClass) {
    var registered = null;
    var i;

    for (i = 0; i < _registeredComponents.length; i++) {

      if (_registeredComponents[i].cssClass === cssClass) {
        registered = _registeredComponents[i];
        break;
      }
    }
    return registered;
  };

  /**
   * Downgrade a given component from element.
   * 
   * @param {HTMLElement} element
   * @param {Componentize.ComponentConfig.name} componentName
   */
  var _downgradeElementInternal = function (element, componentName) {
    var componentsAsString = element.getAttribute('data-' + _constants.DATASET_UPGRADED);
    var componentList = componentsAsString.split(',');
    var componentIndex = componentList.indexOf(componentName);
    var createdComponent /** @type {object} */;
    var i;

    if (componentIndex === -1) return;

    // Removes the component to downgrade from list.
    componentList.splice(componentIndex, 1);
    // Updates dataset attribute.
    element.setAttribute('data-' + _constants.DATASET_UPGRADED, componentList.join(','));

    for (i = 0; i < _createdComponents.length; i++) {
      createdComponent = _createdComponents[i];

      if ((createdComponent.element === element) &&
        createdComponent[_constants.INSTANCE_CONFIG_PROP].name === componentName) {
        // Removes the instance from created list.
        _createdComponents.splice(i, 1);
        break;
      }
    }
    // Deletes the instance from element.
    delete element[componentName];
  };

  /**
   * Registers a specific component for future use.
   * 
   * @param {Componentize.ComponentConfig} 
   */
  var _register = function (config) {
    /** @type {Componentize.ComponentConfig} */
    var configInternal = {};

    // Basics validate of data for register component.
    if (typeof config === 'undefined' ||
      typeof config !== 'object' ||
      typeof config['constructor'] !== 'function' ||
      ((typeof config['name'] !== 'string' ||
        !config['name'].length)) ||
      (typeof config['cssClass'] !== 'string' ||
        !config['cssClass'].length)) {
      throw new Error(_constants.MESSAGE_ERROR_CONFIG);
    }
    configInternal['constructor'] = config['constructor'];
    configInternal['name'] = config['name'];
    configInternal['cssClass'] = config['cssClass'];

    // Verifies if the css class is already registered by another component.
    _registeredComponents.forEach(function (registered) {

      if (registered['cssClass'] === configInternal['cssClass']) {
        throw new Error('The css class "' + configInternal['cssClass'] + '" is already registered.');
      }
    });
    // Store new config into registered components array.
    _registeredComponents.push(configInternal);
  };

  /**
   * Upgrade a specific instance of a registered component.
   * 
   * @param {HTMLElement}
   * @param {string | undefined}
   */
  var _upgradeElement = function (element, optionalCssClass) {
    var cssClasses = [];
    var registeredComponent /** @type {Componentize.ComponentConfig | null} */;
    var isHTMLElement = element instanceof HTMLElement;

    if (!isHTMLElement) return;

    cssClasses = element.classList;

    if (typeof optionalCssClass === 'string' && optionalCssClass.length) {
      registeredComponent = _getRegisteredByClass(optionalCssClass);

      if (registeredComponent) {
        _upgradeElementInternal(element, registeredComponent);
      }
    } else {

      cssClasses.forEach(function (cssClass) {
        registeredComponent = _getRegisteredByClass(cssClass);

        if (registeredComponent) {
          _upgradeElementInternal(element, registeredComponent);
        }
      });
    }
  };

  /**
   * Upgrade a given component and make it created.
   * 
   * @param {Componentize.ComponentConfig.cssClass}
   */
  var _upgrade = function (cssClass) {

    _registeredComponents.forEach(function (registered) {

      if (registered['cssClass'] === cssClass) {
        _upgradeInternal(registered);
      }
    });
  };

  /**
   * Upgrade all registered components and makes them created.
   * 
   */
  var _upgradeAll = function () {

    _registeredComponents.forEach(function (registered) {
      _upgradeInternal(registered);
    });
  };

  /**
   * Apply the downgrade process on specific instance of a created component.
   * 
   * @param {HTMLElement} element
   * @param {string} optionalCssClass
   */
  var _downgradeElement = function (element, optionalCssClass) {
    var componentsAsString = element.getAttribute('data-' + _constants.DATASET_UPGRADED);
    var components = [];
    var isHTMLElement = element instanceof HTMLElement;
    var i;

    if (!isHTMLElement) return;

    if (typeof optionalCssClass === 'string' && optionalCssClass.length) {

      for (i = 0; i < _registeredComponents.length; i++) {

        if (_registeredComponents[i].cssClass === optionalCssClass) {
          _downgradeElementInternal(element, _registeredComponents[i].name);
          break;
        }
      }
    } else {

      if ((typeof componentsAsString !== 'string') || (componentsAsString.split(',') < 2)) return;

      components = componentsAsString.split(',');

      components.forEach(function (componentName) {
        _downgradeElementInternal(element, componentName);
      });
    }
  };

  /**
   * Apply the downgrade process on a given created component.
   * 
   * @param {Componentize.ComponentConfig.cssClass}
   */
  var _downgrade = function (cssClass) {
    var componentName /** @type {string} */;
    var elements /** @type {NodeList} */;
    var elementsSelector /** @type {string} */;
    var i;
    var j;

    if (typeof cssClass !== 'string' || !cssClass.length) return;

    for (i = 0; i < _registeredComponents.length; i++) {

      if (_registeredComponents[i].cssClass === cssClass) {
        componentName = _registeredComponents[i].name;
        break;
      }
    }
    elementsSelector = '[data-' + _constants.DATASET_UPGRADED + '*=' + componentName + ']';
    elements = document.querySelectorAll(elementsSelector);

    for (j = 0; j < elements.length; j++) {
      _downgradeElementInternal(elements[j], componentName);
    }
  };

  /**
   * Apply the downgrade process on all created components.
   * 
   */
  var _downgradeAll = function () {
    var componentName /** @type {string} */;
    var createdComponent /** @type {object} */;
    var createdComponentTotal = _createdComponents.length;
    var i;

    for (i = 0; i < createdComponentTotal; i++) {
      // The components are being removed dynamically.
      // The current created component to downgrade always 
      // will be placed at the first position of list.
      createdComponent = _createdComponents[0];
      componentName = createdComponent[_constants.INSTANCE_CONFIG_PROP].name;
      _downgradeElementInternal(createdComponent.element, componentName);
    }
  };

  /**
   * Returns all registered components.
   * 
   * @return {array<Componentize.ComponentConfig> | array}
   */
  var _getAllRegistered = function () {
    return _registeredComponents;
  };


  /**
   * Returns all created components.
   * 
   * @return {array<object> | array}
   */
  var _getAllCreated = function () {
    return _createdComponents;
  };

  return {
    register: _register,
    upgradeElement: _upgradeElement,
    upgrade: _upgrade,
    upgradeAll: _upgradeAll,
    downgradeElement: _downgradeElement,
    downgrade: _downgrade,
    downgradeAll: _downgradeAll,
    getAllRegistered: _getAllRegistered,
    getAllCreated: _getAllCreated,
  };
})();

// Componentize is available globally.
window['Componentize'] = Componentize;

window.addEventListener('load', function () {
  // Initializes all components.
  Componentize.upgradeAll();
});