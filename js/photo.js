'use strict';

(function() {

  var REQUEST_FAILURE_TIMEOUT = 10000;
  var pictureTemplate = document.getElementById('picture-template');

  /**
   * @constructor
   * @param {Object} data
   */
  var Photo = function(data) {
    this._data = data;
    this._onClick = this._onClick.bind(this);
  };

  /**
   * Create DOM element and fill DocumentFragment of them
   * @param {DocumentFragment} container
   */
  Photo.prototype.render = function(container) {
    var newPhotoElement = pictureTemplate.content.children[0].cloneNode(true);

    newPhotoElement.querySelector('.picture-comments').textContent = this._data['comments'];
    newPhotoElement.querySelector('.picture-likes').textContent = this._data['likes'];

    container.appendChild(newPhotoElement);

    if (!this._data['url']) {
      newPhotoElement.classList.add('picture-load-failure');
      return;
    }

    var newImg = new Image();
    newImg.src = this._data['url'];

    var imageLoadTimeout = setTimeout(function() {
      newPhotoElement.classList.add('picture-load-failure');
    }, REQUEST_FAILURE_TIMEOUT);

    newImg.addEventListener('load', function() {
      newImg.width = 182;
      newImg.height = 182;
      var oldImg = newPhotoElement.querySelector('img');
      newPhotoElement.replaceChild(newImg, oldImg);
      clearTimeout(imageLoadTimeout);
    });

    newImg.addEventListener('error', function() {
      newPhotoElement.classList.add('picture-load-failure');
    });

    this._element = newPhotoElement;
    this._element.addEventListener('click', this._onClick);
  };

  Photo.prototype.unrender = function() {
    this._element.parentNode.removeChild(this._element);
    this._element.removeEventListener('click', this._onClick);
    this._element = null;
  };

  Photo.prototype._onClick = function(event) {
    event.preventDefault();
    if (!this._element.classList.contains('picture-load-failure')) {
      var galleryEvent = new CustomEvent('galleryclick', { detail: { photoUrl: this._data['url'] } });
      window.dispatchEvent(galleryEvent);
    }
  };

  window.Photo = Photo;
})();