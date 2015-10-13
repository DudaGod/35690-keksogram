'use strict';

(function() {
  var KEY = {
    ESC: 27,
    LEFT: 37,
    RIGHT: 39
  };

  var hiddenGallery = 'invisible';

  function loopPhotos(value, min, max) {
    if (value > max) {
      return min;
    } else if (value < min) {
      return max;
    }
    return value;
  }


  var Gallery = function() {
    this._element = document.querySelector('.gallery-overlay');
    this._closeButton = this._element.querySelector('.gallery-overlay-close');
    this._photoElement = this._element.querySelector('.gallery-overlay-image');

    this._currentPhoto = 0;
    this._photos = [];

    this._onCloseClick = this._onCloseClick.bind(this);
    this._onCloseOverlayClick = this._onCloseOverlayClick.bind(this);
    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  };

  Gallery.prototype.show = function() {
    this._element.classList.remove(hiddenGallery);

    this._closeButton.addEventListener('click', this._onCloseClick);
    this._element.addEventListener('click', this._onCloseOverlayClick);
    this._photoElement.addEventListener('click', this._onPhotoClick);
    document.body.addEventListener('keydown', this._onKeyDown);

    this._showCurrentPhoto();
  };

  Gallery.prototype.hide = function() {
    this._element.classList.add(hiddenGallery);

    this._closeButton.removeEventListener('click', this._onCloseClick);
    this._element.removeEventListener('click', this._onCloseOverlayClick);
    this._photoElement.removeEventListener('click', this._onPhotoClick);
    document.body.removeEventListener('keydown', this._onKeyDown);

    this._photos = [];
    this._currentPhoto = 0;
  };

  Gallery.prototype._showCurrentPhoto = function() {
    this._photoElement.src = this._photos[this._currentPhoto];

    this._photoElement.onload = function() {
      this._photoElement.classList.remove('picture-load-failure');
      this._photoElement.style.backgroundColor = '#fff';
    }.bind(this);

    this._photoElement.onerror = function() {
      this._photoElement.classList.add('picture-load-failure');
      this._photoElement.style.backgroundColor = '#000';
      this._photoElement.style.opacity = '1';
    }.bind(this);
  };

  Gallery.prototype._onCloseClick = function(event) {
    event.preventDefault();
    this.hide();
  };

  Gallery.prototype._onCloseOverlayClick = function(event) {
    event.preventDefault();
    this.hide();
  };

  Gallery.prototype._onPhotoClick = function(event) {
    event.preventDefault();
    event.stopPropagation();
    var clickedPhoto = event.target;
    var photoMiddlePosX = clickedPhoto.x + clickedPhoto.width / 2;;

    if (event.clientX <= photoMiddlePosX) {
      this.setCurrentPhoto(this._currentPhoto - 1);
    } else {
      this.setCurrentPhoto(this._currentPhoto + 1);
    }
  };

  Gallery.prototype._onKeyDown = function(event) {
    switch (event.keyCode) {
      case KEY.ESC:
        this.hide();
        break;

      case KEY.LEFT:
        this.setCurrentPhoto(this._currentPhoto - 1);
        break;

      case KEY.RIGHT:
        this.setCurrentPhoto(this._currentPhoto + 1);
        break;
    }
  };

  Gallery.prototype.setCurrentPhoto = function(index) {
    index = loopPhotos(index, 0, this._photos.length - 1);

    if (this._currentPhoto === index) {
      return;
    }

    this._currentPhoto = index;
    this._showCurrentPhoto();
  };

  Gallery.prototype.setPhotos = function(photos) {
    this._photos = photos;
  };

  window.Gallery = Gallery;
})();
