'use strict';

define(function() {
  /**
   * @constructor
   * @extends {Backbone.Model}
   */
  var PhotoModel = Backbone.Model.extend({
    like: function() {
      this.set('liked', true);
    },

    dislike: function() {
      this.set('liked', false);
    },

    unsetlike: function() {
      this.unset('liked', 'silent');
    }
  });

  return PhotoModel;
});
