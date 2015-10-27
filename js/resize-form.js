/* global resizer: true */

'use strict';
define(function() {
  /**
   * @const
   * @type {number}
   */
  var SIDE_VALUE_MIN = 50;

  /**
   * @constructor
   */
  var ResizeInputs = function() {
    this._resizeForm = document.getElementById('upload-resize');
    this._uploadForm = document.getElementById('upload-select-image');
    this._filterForm = document.getElementById('upload-filter');
    this._x = document.getElementById('resize-x');
    this._y = document.getElementById('resize-y');
    this._side = document.getElementById('resize-size');
    this._closeBtn = document.getElementById('resize-prev');

    this._cropImage = this._filterForm.querySelector('.filter-image-preview');
    this._image = null;
    this._canvas = null;

    this._onChangeDisplacement = this._onChangeDisplacement.bind(this);
    this._onChangeSide = this._onChangeSide.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onLoadCanvas = this._onLoadCanvas.bind(this);
    this._resizerChanged = this._resizerChanged.bind(this);
  };

  ResizeInputs.prototype = {
    /**
     * Sets default values and creates the list of event handlers
     */
    initialize: function() {
      this._x.min = this._x.value = 0;
      this._y.min = this._y.value = 0;
      this._side.min = this._side.value = SIDE_VALUE_MIN;

      this._x.addEventListener('change', this._onChangeDisplacement);
      this._y.addEventListener('change', this._onChangeDisplacement);
      this._side.addEventListener('change', this._onChangeSide);
      this._closeBtn.addEventListener('click', this._onCancel);
      this._resizeForm.addEventListener('submit', this._onSubmit);
      window.addEventListener('canvasloaded', this._onLoadCanvas);
      window.addEventListener('resizerchange', this._resizerChanged);
    },

    /**
     * Sets max values of each input fields
     * @private
     */
    _setInputsMax: function() {
      this._x.max = Math.max(this._image.naturalWidth - this._side.value, 0);
      this._y.max = Math.max(this._image.naturalHeight - this._side.value, 0);
      this._side.max = Math.min(this._canvas.width, this._canvas.height);
    },

    /**
     * Corrects input value if it is more than max or less than min
     * @param {Element} elem
     * @private
     */
    _validateInputValues: function(elem) {
      if (Number(elem.value) > Number(elem.max)) {
        elem.value = elem.max;
      } else if (Number(elem.value) < Number(elem.min)) {
        elem.value = elem.min;
      }
    },

    /**
     * Corrects displacement of image relatively limit values of cropping square
     * @param {Resizer} resizerVal
     * @param {Element} inputVal
     * @param {boolean|undefined} isResizeY
     * @private
     */
    _validateResizerValues: function(resizerVal, inputVal, isResizeY) {
      isResizeY = isResizeY ? true : false;
      if (resizerVal > Number(inputVal.max)) {
        if (isResizeY) {
          resizer.setConstraint(resizerVal.x, Number(inputVal.max));
        } else {
          resizer.setConstraint(Number(inputVal.max));
        }
      } else if (resizerVal < Number(inputVal.min)) {
        if (isResizeY) {
          resizer.setConstraint(resizerVal.x, Number(inputVal.min));
        } else {
          resizer.setConstraint(Number(inputVal.min));
        }
      }
    },

    /**
     * Event handler of change input value of x or y
     * @private
     */
    _onChangeDisplacement: function() {
      this._validateInputValues(this._x);
      this._validateInputValues(this._y);
      resizer.setConstraint(Number(this._x.value), Number(this._y.value));
    },

    /**
     * Event handler of change input value side (size of cropping square)
     * @private
     */
    _onChangeSide: function() {
      this._validateInputValues(this._side);
      var resizerValues = resizer.getConstraint();
      var sideDiff = (resizerValues.side - Number(this._side.value)) / 2;
      resizer.setConstraint(resizerValues.x + sideDiff, resizerValues.y + sideDiff, Number(this._side.value));
    },

    /**
     * Custom event (canvasloaded)
     * @private
     */
    _onLoadCanvas: function() {
      this._canvas = this._resizeForm.querySelector('canvas');
      this._image = resizer.getImage();
      this._setInputsMax();

      var resizerValues = resizer.getConstraint();
      this._side.value = Math.floor(resizerValues.side);
      this._x.value = Math.floor(resizerValues.x);
      this._y.value = Math.floor(resizerValues.y);
    },

    /**
     * Custom event (resizerchange) triggered, when size of cropping square is changed
     * @private
     */
    _resizerChanged: function() {
      var resizerValues = resizer.getConstraint();
      this._x.value = Math.floor(resizerValues.x);

      this._validateResizerValues(resizerValues.x, this._x);
      this._validateResizerValues(resizerValues.y, this._y, true);
    },

    /**
     * Listens clicks on a cross button and remove all listeners
     * @param {Event} event
     * @private
     */
    _onCancel: function(event) {
      event.preventDefault();

      this._resizeForm.reset();
      this._uploadForm.reset();
      this._resizeForm.classList.add('invisible');
      this._uploadForm.classList.remove('invisible');

      this._cleanupListeners();
    },

    /**
     * Send cropped photo to the server
     * @param {Event} event
     * @private
     */
    _onSubmit: function(event) {
      event.preventDefault();

      this._cropImage.src = resizer.exportImage().src;
      this._resizeForm.classList.add('invisible');
      this._filterForm.classList.remove('invisible');
    },

    /**
     * Unsubscribe of all events
     * @private
     */
    _cleanupListeners: function() {
      this._x.removeEventListener('change', this._onChangeDisplacement);
      this._y.removeEventListener('change', this._onChangeDisplacement);
      this._side.removeEventListener('change', this._onChangeSide);
      this._closeBtn.removeEventListener('click', this._onCancel);
      this._resizeForm.removeEventListener('submit', this._onSubmit);
      window.removeEventListener('canvasloaded', this._onLoadCanvas);
      window.removeEventListener('resizerchange', this._resizerChanged);
    }
  };

  return ResizeInputs;
});
