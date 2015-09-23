(function() {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = filterForm.querySelector('.filter-image-preview');
  var prevButton = filterForm['filter-prev'];

  var selectedFilter = filterForm['upload-filter'];
  var filterCookieName = selectedFilter['upload-filter-none'].name;

  if (docCookies.hasItem(filterCookieName)) {
    selectedFilter.value = docCookies.getItem(filterCookieName);
  }

  var BIRTH_DAY = new Date(1989, 10, 28, 21);
  var MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

  var filterMap;

  function setFilter() {
    if (!filterMap) {
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome-test',
        'sepia': 'filter-sepia'
      };
    }
    previewImage.className = 'filter-image-preview' + ' ' + filterMap[selectedFilter.value];
  }

  for (var i = 0, l = selectedFilter.length; i < l; i++) {
    selectedFilter[i].onchange = function(evt) {
      setFilter();
    }
  }

  prevButton.onclick = function(evt) {
    evt.preventDefault();

    filterForm.reset();
    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  filterForm.onsubmit = function(evt) {
    evt.preventDefault();

    var expireDate = new Date();
    var expireDateInDays = expireDate.getDate() + Math.round((expireDate - BIRTH_DAY) / MILLISECONDS_IN_DAY);
    expireDate.setDate(expireDateInDays);
    docCookies.setItem(filterCookieName, selectedFilter.value, expireDate);

    uploadForm.classList.remove('invisible');
    filterForm.classList.add('invisible');

    filterForm.submit();
  };

  setFilter();
})();
