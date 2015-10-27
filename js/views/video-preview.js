/* global Backbone: true */

'use strict';

(function() {

  /**
   * @constructor
   * @extends {Backbone.View}
   */
  var VideoPreview = Backbone.View.extend({
    events: {
      click: '_onClick'
    },

    /**
     * @override
     */
    initialize: function() {
      this._onClick = this._onClick.bind(this);
      this._onModelLike = this._onModelLike.bind(this);
      this.listenTo(this.model, 'change:liked', this._onModelLike);

      this.img = null;
      this.video = null;
    },

    /**
     * display video
     * @override
     */
    render: function() {
      this.el.querySelector('.comments-count').textContent = this.model.get('comments');
      this.el.querySelector('.likes-count').textContent = this.model.get('likes');
      this.el.querySelector('.likes-count').classList.remove('likes-count-liked');

      this.img = this.el.querySelector('.gallery-overlay-image');

      this.video = document.createElement('video');
      this.video.classList.add('video');
      this.video.width = 640;
      this.video.height = 640;
      this.video.src = this.model.get('url');
      this.video.poster = this.model.get('preview');
      this.video.controls = false;
      this.video.loop = true;

      this.el.replaceChild(this.video, this.img);
    },

    /**
     * clear all event listeners, replace video with image back and update like attribute
     * @override
     */
    destroy: function() {
      this.el.replaceChild(this.img, this.video);
      this.stopListening();
      this.undelegateEvents();
      this.model.unsetlike();
    },

    /**
     * Event handler on photo preview.
     * @param {Event} event
     * @private
     */
    _onClick: function(event) {
      event.stopPropagation();
      var clickedElement = event.target;
      if (clickedElement.classList.contains('likes-count')) {
        if (this.model.get('liked')) {
          this.model.dislike();
        } else {
          this.model.like();
        }
      } else if (clickedElement.tagName === 'VIDEO') {
        this.video.paused ? this.video.play() : this.video.pause();
      }
    },

    /**
     * @private
     */
    _onModelLike: function() {
      this._updateLike();
    },

    /**
     * @private
     */
    _updateLike: function() {
      var likeButton = this.el.querySelector('.likes-count');
      if (this.model.get('liked')) {
        likeButton.textContent = Number(likeButton.textContent) + 1;
        likeButton.classList.add('likes-count-liked');
      } else {
        likeButton.textContent = Number(likeButton.textContent) - 1;
        likeButton.classList.remove('likes-count-liked');
      }
    }
  });

  window.VideoPreview = VideoPreview;
})();
