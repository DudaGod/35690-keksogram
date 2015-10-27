'use strict';
(function() {
  var SIDE_VALUE_MIN = 50;

  var ResizeInputs = function () {
    this._resizeForm = document.getElementById('upload-resize');
    this._uploadForm = document.getElementById('upload-select-image');
    this._filterForm = document.getElementById('upload-filter');
    this._x = document.getElementById('resize-x');
    this._y = document.getElementById('resize-y');
    this._side = document.getElementById('resize-size');
    this._closeBtn = document.getElementById('resize-prev');

    this._cropImage = this._filterForm.querySelector('.filter-image-preview');
    this._image = this._resizeForm.querySelector('.resize-image-preview');
    this._canvas = null;

    this._onChangeDisplacement = this._onChangeDisplacement.bind(this);
    this._onChangeSide = this._onChangeSide.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onLoadCanvas = this._onLoadCanvas.bind(this);
    this._resizerChanged = this._resizerChanged.bind(this);
  };

  ResizeInputs.prototype = {
    initialize: function() {
      this._x.min = this._x.value = 0;
      this._y.min = this._y.value = 0;
      this._side.min = this._side.value = SIDE_VALUE_MIN;

      this._image.classList.remove('invisible');

      this._x.addEventListener('change', this._onChangeDisplacement);
      this._y.addEventListener('change', this._onChangeDisplacement);
      this._side.addEventListener('change', this._onChangeSide);
      this._closeBtn.addEventListener('click', this._onCancel);
      this._resizeForm.addEventListener('submit', this._onSubmit);
      window.addEventListener('canvasloaded', this._onLoadCanvas);
      window.addEventListener('resizerchange', this._resizerChanged);
    },

    _setInputsMax: function() {
      this._x.max = Math.max(this._image.naturalWidth - this._side.value, 0);
      this._y.max = Math.max(this._image.naturalHeight - this._side.value, 0);
      this._side.max = Math.min(this._canvas.width, this._canvas.height);
    },

    _validateInputValues: function(elem) {
      if (Number(elem.value) > Number(elem.max)) {
        elem.value = elem.max;
      } else if (Number(elem.value) < Number(elem.min)) {
        elem.value = elem.min;
      }
    },

    _validateResizerValues: function(resizerVal, inputVal, isY) {
      if (resizerVal > Number(inputVal.max)) {
        isY ? resizer.setConstraint(undefined, Number(inputVal.max)) :
          resizer.setConstraint(Number(inputVal.max));
      } else if (resizerVal < Number(inputVal.min)) {
        isY ? resizer.setConstraint(undefined, Number(inputVal.min)) :
          resizer.setConstraint(Number(inputVal.min));
      }
    },

    _onChangeDisplacement: function() {
      this._validateInputValues(this._x);
      this._validateInputValues(this._y);
      resizer.setConstraint(Number(this._x.value), Number(this._y.value));
    },

    _onChangeSide: function() {
      this._validateInputValues(this._side);
      var resizerValues = resizer.getConstraint();
      var sideDiff = (resizerValues.side - Number(this._side.value)) / 2;
      resizer.setConstraint(resizerValues.x + sideDiff, resizerValues.y + sideDiff, Number(this._side.value));
    },

    _onLoadCanvas: function() {
      this._canvas = this._resizeForm.querySelector('canvas');
      this._image.classList.add('invisible');
      this._setInputsMax();

      var resizerValues = resizer.getConstraint();
      this._side.value = Math.floor(resizerValues.side);
      this._x.value = Math.floor(resizerValues.x);
      this._y.value = Math.floor(resizerValues.y);
    },

    _resizerChanged: function() {
      var resizerValues = resizer.getConstraint();
      this._x.value = Math.floor(resizerValues.x);

      this._validateResizerValues(resizerValues.x, this._x);
      this._validateResizerValues(resizerValues.y, this._y, true);
    },

    _onCancel: function(event) {
      event.preventDefault();

      this._resizeForm.reset();
      this._uploadForm.reset();
      this._resizeForm.classList.add('invisible');
      this._uploadForm.classList.remove('invisible');
      this._image.classList.remove('invisible');

      this._cleanupListeners();
    },

    _onSubmit: function(event) {
      event.preventDefault();

      this._cropImage.src = resizer.exportImage().src;
      this._resizeForm.classList.add('invisible');
      this._filterForm.classList.remove('invisible');
    },

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

  window.ResizeInputs = ResizeInputs;
})();
