'use strict';

define(function() {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = filterForm.querySelector('.filter-image-preview');
  var prevButton = filterForm['filter-prev'];
  var selectedFilter = filterForm['upload-filter'];

  var BIRTH_DAY = new Date(1989, 10, 28, 21);
  var MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

  var filterMap;

  function setFilter() {
    if (!filterMap) {
      filterMap = {
        none: 'filter-none',
        chrome: 'filter-chrome',
        sepia: 'filter-sepia'
      };
    }
    previewImage.className = 'filter-image-preview' + ' ' + filterMap[selectedFilter.value];
  }

  for (var i = 0, l = selectedFilter.length; i < l; i++) {
    selectedFilter[i].onchange = function() {
      setFilter();
    };
  }

  prevButton.onclick = function(evt) {
    evt.preventDefault();
    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  filterForm.onsubmit = function(evt) {
    evt.preventDefault();

    var expireDate = new Date();
    var expireDateInDays = expireDate.getDate() + Math.round((expireDate - BIRTH_DAY) / MILLISECONDS_IN_DAY);
    expireDate.setDate(expireDateInDays);
    docCookies.setItem('upload-filter', selectedFilter.value, expireDate);

    uploadForm.classList.remove('invisible');
    filterForm.classList.add('invisible');

    filterForm.submit();
  };

  if (docCookies.hasItem('upload-filter')) {
    selectedFilter.value = docCookies.getItem('upload-filter');
  }

  setFilter();
});
