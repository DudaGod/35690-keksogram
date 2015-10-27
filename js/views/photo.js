/* global Backbone: true */

'use strict';

(function() {
  /**
   * @const
   * @type {number}
   */
  var REQUEST_FAILURE_TIMEOUT = 10000;

  /**
   * @constructor
   * @extends {Backbone.View}
   */
  var PhotoView = Backbone.View.extend({
    /**
     * @type {Object.<string, string>}
     * @override
     */
    events: {
      click: '_onClick'
    },

    /**
     * @override
     */
    initialize: function() {
      this._onImageLoad = this._onImageLoad.bind(this);
      this._onImageFail = this._onImageFail.bind(this);
      this._onClick = this._onClick.bind(this);
    },

    /**
     * display photo
     * @override
     */
    render: function() {
      this.el.querySelector('.picture-comments').textContent = this.model.get('comments');
      this.el.querySelector('.picture-likes').textContent = this.model.get('likes');

      if (this.model.get('url')) {
        var newImage = new Image();
        newImage.width = 182;
        newImage.height = 182;

        newImage.src = this.model.get('preview') ? this.model.get('preview') : this.model.get('url');

        this._imageLoadTimeout = setTimeout(function() {
          this.el.classList.add('picture-load-failure');
        }.bind(this), REQUEST_FAILURE_TIMEOUT);

        newImage.addEventListener('load', this._onImageLoad);
        newImage.addEventListener('error', this._onImageFail);
        newImage.addEventListener('abort', this._onImageFail);
      }
    },

    /**
     * Event handler on photo element.
     * @param {MouseEvent} event
     * @private
     */
    _onClick: function(event) {
      event.preventDefault();
      var clickedElement = event.target;

      if (!clickedElement.classList.contains('picture-load-failure')) {
        this.trigger('photoclick');
      }
    },

    /**
     * @param {Event} event
     * @private
     */
    _onImageLoad: function(event) {
      clearTimeout(this._imageLoadTimeout);
      var loadedImage = event.target;

      this._cleanupImageListeners(loadedImage);

      var oldImg = this.el.querySelector('img');
      this.el.replaceChild(loadedImage, oldImg);
    },

    /**
     * @param {Event} event
     * @private
     */
    _onImageFail: function(event) {
      var failedImage = event.target;
      this._cleanupImageListeners(failedImage);

      this.el.classList.add('picture-load-failure');
    },

    /**
     * @param {Image} image
     * @private
     */
    _cleanupImageListeners: function(image) {
      image.removeEventListener('load', this._onImageLoad);
      image.removeEventListener('error', this._onImageFail);
      image.removeEventListener('abort', this._onImageFail);
    }
  });

  window.PhotoView = PhotoView;
})();
