'use strict';

(function() {

  var REQUEST_FAILURE_TIMEOUT = 10000;
  var pictureTemplate = document.getElementById('picture-template');

  /**
   * @constructor
   * @param {Object} data
   */
  var Picture = function(data) {
    this._data = data;
    this._onClick = this._onClick.bind(this);
  };

  /**
   * Create DOM element and fill DocumentFragment of them
   * @param {DocumentFragment} container
   */
  Picture.prototype.render = function(container) {
    var newPictureElement = pictureTemplate.content.children[0].cloneNode(true);

    newPictureElement.querySelector('.picture-comments').textContent = this._data['comments'];
    newPictureElement.querySelector('.picture-likes').textContent = this._data['likes'];

    container.appendChild(newPictureElement);

    if (!this._data['url']) {
      newPictureElement.classList.add('picture-load-failure');
      return;
    }

    var newImg = new Image();
    newImg.src = this._data['url'];

    var imageLoadTimeout = setTimeout(function() {
      newPictureElement.classList.add('picture-load-failure');
    }, REQUEST_FAILURE_TIMEOUT);

    newImg.addEventListener('load', function() {
      newImg.width = 182;
      newImg.height = 182;
      var oldImg = newPictureElement.querySelector('img');
      newPictureElement.replaceChild(newImg, oldImg);
      clearTimeout(imageLoadTimeout);
    });

    newImg.addEventListener('error', function() {
      newPictureElement.classList.add('picture-load-failure');
    });

    this._element = newPictureElement;
    this._element.addEventListener('click', this._onClick);
  };

  Picture.prototype.unrender = function() {
    this._element.parentNode.removeChild(this._element);
    this._element.removeEventListener('click', this._onClick);
    this._element = null;
  };

  Picture.prototype._onClick = function() {
    if (!this._element.classList.contains('picture-load-failure')) {
      var galleryEvent = new CustomEvent('galleryclick', { detail: { pictureElement: this } });
      window.dispatchEvent(galleryEvent);
    }
  };

  window.Picture = Picture;
})();