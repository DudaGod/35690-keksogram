/* global Backbone: true */

'use strict';

(function() {

  /**
   * @constructor
   * @extends {Backbone.View}
   */
  var PhotoPreView = Backbone.View.extend({
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
    },

    /**
     * display photo preview
     * @override
     */
    render: function() {
      this.el.querySelector('.comments-count').textContent = this.model.get('comments');
      this.el.querySelector('.gallery-overlay-image').src = this.model.get('url');
      this.el.querySelector('.likes-count').textContent = this.model.get('likes');
      this.el.querySelector('.likes-count').classList.remove('likes-count-liked');
    },

    /**
     * clear all event listeners and update like attribute
     * @override
     */
    destroy: function() {
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

  window.PhotoPreView = PhotoPreView;
})();
