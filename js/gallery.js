'use strict';

(function() {
  var KEY = {
    ESC: 27,
    LEFT: 37,
    RIGHT: 39
  };

  var picturesContainer = document.querySelector('.pictures');
  var galleryElement = document.querySelector('.gallery-overlay');
  var closeButton = galleryElement.querySelector('.gallery-overlay-close');
  var hiddenGallery = 'invisible';

  picturesContainer.addEventListener('click', function(event) {
    event.preventDefault();
    if (doesHaveParent(event.target, 'picture')) {
      showGallery();
    }
  });

  /**
   * Check if element has a class - className
   * @param {Object} element
   * @param {string} className
   * @returns {boolean}
   */
  function doesHaveParent(element, className) {
    do {
      if (element.classList.contains(className)) {
        return !element.classList.contains('picture-load-failure');
      }
      element = element.parentElement;
    } while (element);
    return false;
  }

  function showGallery() {
    galleryElement.classList.remove(hiddenGallery);
    closeButton.addEventListener('click', closeHandler);
    document.body.addEventListener('keydown', keyHandler);
  }

  function hideGallery() {
    galleryElement.classList.add(hiddenGallery);
    closeButton.removeEventListener('click', closeHandler);
    document.body.removeEventListener('keydown', keyHandler);
  }

  function closeHandler(event) {
    event.preventDefault();
    hideGallery();
  }

  function keyHandler(event) {
    switch (event.keyCode) {
      case KEY.LEFT:
        console.log('show previous photo');
        break;
      case KEY.RIGHT:
        console.log('show next photo');
        break;
      case KEY.ESC:
        hideGallery();
        break;
    }
  }

})();
