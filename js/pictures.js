"use strict";

(function() {
  var picturesContainer = document.querySelector('.pictures');
  var pictureTemplate = document.getElementById('picture-template');
  var filtersBlock = document.querySelector('.filters');
  var picturesFragment = document.createDocumentFragment();

  hideFilter();

  pictures.forEach(function(picture) {
    var newPictureElement = pictureTemplate.content.children[0].cloneNode(true);

    newPictureElement.querySelector('.picture-comments').textContent = picture['comments'];
    newPictureElement.querySelector('.picture-likes').textContent = picture['likes'];

    picturesFragment.appendChild(newPictureElement);

    var oldImg = newPictureElement.querySelector('img');

    if (picture['url']) {
      var newImg = new Image();
      newImg.src = picture['url'];

      newImg.onload = function() {
        newPictureElement.replaceChild(newImg, oldImg);
        newImg.width = '182';
        newImg.height = '182';
      };

      newImg.onerror = function() {
        newPictureElement.classList.add('picture-load-failure')
      };
    }
  });
  picturesContainer.appendChild(picturesFragment);

  showFilter();

  function hideFilter() {
    if (!filtersBlock.classList.contains('hidden')) {
      filtersBlock.classList.add('hidden');
    }
  }

  function showFilter() {
    if (filtersBlock.classList.contains('hidden')) {
      filtersBlock.classList.remove('hidden');
    }
  }
})();