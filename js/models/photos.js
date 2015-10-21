/* global Backbone: true PhotoModel: true */

'use strict';

(function() {
  /**
   * @constructor
   * @extends {Backbone.Collection}
   * @param (Object) attributes
   * @param (Object) options
   */
  var PhotosCollection = Backbone.Collection.extend({
    model: PhotoModel,
    url: 'data/pictures.json'
  });

  window.PhotosCollection = PhotosCollection;
})();
