/**
 * Clock demo component.
 * 
 * @author Alexandre Thebaldi <ahlechandre@gmail.com>
 * @example Creating and registering a component.
 */
(function () {
  
  /**
   * Show current datetime on element click.
   *   
   * @constructor  
   */  
  function ClockComponent(element) {
    // HTML Element (instance) of component.
    this.element = element; 

    // Initializes the instance.
    this.init();            
  }
  
  /**
   * 
   * @private
   */
  ClockComponent.prototype._showDatetimeOnClick = function () {

    this.element.addEventListener('click', function (e) {
      alert(new Date());
    });
  };
  
  /**
   * Initializes the instance.
   * 
   */
  ClockComponent.prototype.init = function () {

    if (this.element) {
      this._showDatetimeOnClick();
    }     
  };
  
  // Componentize is available globally.
  // Registers the new component. Componentize will be upgrade all 
  // registered on page load.
  Componentize.register({
    name: 'ClockComponent', // Prefer to assign constructor as string (recommended).
    cssClass: 'clock-component', // The "key". Must be unique for each different component.
    constructor: ClockComponent // The component constructor function.
  });
})();