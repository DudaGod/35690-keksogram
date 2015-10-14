'use strict';

(function() {
  /**
   * List of const keyCode to handle keyboard events.
   * @readonly
   * @enum {number}
   */
  var KEY = {
    ESC: 27,
    LEFT: 37,
    RIGHT: 39
  };

  /**
   * Name of class which responsible for hide Gallery.
   * @type {string}
   */
  var hiddenClass = 'invisible';

  /**
   * This function makes list of photos like an infinite cycle from min to max.
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @return {number}
   */
  function getExistingIndexOfPhoto(value, min, max) {
    if (value > max) {
      return min;
    } else if (value < min) {
      return max;
    }
    return value;
  }

  /**
   * Constructor of Gallery object.
   * @constructor
   */
  var Gallery = function() {
    this._element = document.querySelector('.gallery-overlay');
    this._closeButton = this._element.querySelector('.gallery-overlay-close');
    this._photoElement = this._element.querySelector('.gallery-overlay-image');

    this._currentPhoto = 0;
    this._photos = [];

    //this._on = function(element, event, callback) {
    //  element.addEventListener(event, callback.bind(this));
    //};
    //this._off = function(element, event, callback) {
    //  element.removeEventListener(event, callback.bind(this));
    //};
    this._onCloseClick = this._onCloseClick.bind(this);
    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  };

  /**
   * Show photo gallery and subscribe on event handlers.
   */
  Gallery.prototype.show = function() {
    this._element.classList.remove(hiddenClass);

    //this._on(this._closeButton, 'click', this._onCloseClick);
    //this._on(this._element, 'click', this._onCloseClick);
    //this._on(this._photoElement, 'click', this._onPhotoClick);
    //this._on(document.body, 'keydown', this._onKeyDown);
    this._closeButton.addEventListener('click', this._onCloseClick);
    this._element.addEventListener('click', this._onCloseClick);
    this._photoElement.addEventListener('click', this._onPhotoClick);
    document.body.addEventListener('keydown', this._onKeyDown);
  };

  /**
   * Hide photo gallery and unsubscribe from event handlers.
   */
  Gallery.prototype.hide = function() {
    this._element.classList.add(hiddenClass);

    this._closeButton.removeEventListener('click', this._onCloseClick);
    this._element.removeEventListener('click', this._onCloseClick);
    this._photoElement.removeEventListener('click', this._onPhotoClick);
    //this._off(document.body, 'keydown', this._onKeyDown);
    document.body.removeEventListener('keydown', this._onKeyDown);
  };

  /**
   * Private method, which show current photo via changing src.
   * If photo not loaded - show failure picture.
   * @private
   */
  Gallery.prototype._showCurrentPhoto = function() {
    this._photoElement.src = this._photos[this._currentPhoto];

    this._photoElement.onload = function() {
      this._photoElement.classList.remove('picture-load-failure');
    }.bind(this);

    this._photoElement.onerror = function() {
      this._photoElement.classList.add('picture-load-failure');
    }.bind(this);
  };

  /**
   * Event handler of click on the cross or on the overlay.
   * @param {Event} event
   * @private
   */
  Gallery.prototype._onCloseClick = function(event) {
    event.preventDefault();
    this.hide();
  };

  /**
   * Event handler of click on photo.
   * If click on left side of photo - will be shown previous photo.
   * If on right - next photo.
   * @param {Event} event
   * @private
   */
  Gallery.prototype._onPhotoClick = function(event) {
    event.preventDefault();
    event.stopPropagation();
    var clickedPhoto = event.target;
    var photoMiddlePosX = clickedPhoto.x + clickedPhoto.width / 2;

    if (event.clientX <= photoMiddlePosX) {
      this.setPreviousPhoto();
    } else {
      this.setNextPhoto();
    }
  };

  /**
   * Event handler of keyboard events.
   * @param {Event} event
   * @private
   */
  Gallery.prototype._onKeyDown = function(event) {
    switch (event.keyCode) {
      case KEY.ESC:
        this.hide();
        break;

      case KEY.LEFT:
        this.setPreviousPhoto();
        break;

      case KEY.RIGHT:
        this.setNextPhoto();
        break;
    }
  };

  /**
   * Set current index of photo which will be shown, but before it
   * check if index is correct.
   * @param {number} index
   */
  Gallery.prototype.setCurrentPhoto = function(index) {
    index = getExistingIndexOfPhoto(index, 0, this._photos.length - 1);

    this._currentPhoto = index;
    this._showCurrentPhoto();
  };

  /**
   * Partial apply of setCurrentPhoto
   */
  Gallery.prototype.setPreviousPhoto = function() {
    this.setCurrentPhoto(this._currentPhoto - 1);
  };

  /**
   * Partial apply of setCurrentPhoto
   */
  Gallery.prototype.setNextPhoto = function() {
    this.setCurrentPhoto(this._currentPhoto + 1);
  };

  /**
   * Save list of photos.
   * @param {Array.<string>} photos
   */
  Gallery.prototype.setPhotos = function(photos) {
    this._photos = photos;
  };

  // Export Gallery constructor to global scope.
  window.Gallery = Gallery;
})();
