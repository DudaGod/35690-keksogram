'use strict';

(function() {
  var XHR_STATE = {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4
  };

  var REQUEST_FAILURE_TIMEOUT = 10000;
  var MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
  var dateNow = new Date();
  var picturesContainer = document.querySelector('.pictures');
  var filtersBlock = document.querySelector('.filters');
  var hiddenFilters = 'hidden';
  var pictures;

  hideFilter();

  initFilters();
  loadPictures(function(loadedPictures) {
    pictures = loadedPictures;
    setActiveFilter('popular');
  });

  showFilter();


  function hideFilter() {
    filtersBlock.classList.add(hiddenFilters);
  }

  function showFilter() {
    filtersBlock.classList.remove(hiddenFilters);
  }

  function initFilters() {
    var filterElements = document.querySelectorAll('.filters-radio');
    for (var i = 0; i < filterElements.length; i++) {
      filterElements[i].onclick = function(evt) {
        var clickedFilter = evt.currentTarget;
        setActiveFilter(clickedFilter.value);
      };
    }
  }

  /**
   * Send a request if pictures received successfully
   * @param {requestCallback} callback - The callback that handles the response
   */
  function loadPictures(callback) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = REQUEST_FAILURE_TIMEOUT;
    xhr.open('get', 'data/pictures.json');

    xhr.onreadystatechange = function(evt) {
      var loadedXhr = evt.target;

      switch (loadedXhr.readyState) {
        case XHR_STATE.DONE:
          if (loadedXhr.status !== 200) {
            showLoadFailure();
          } else {
            picturesContainer.classList.remove('pictures-loading');
            callback(JSON.parse(loadedXhr.response));
          }
          break;

        default:
          picturesContainer.classList.add('pictures-loading');
          break;
      }
    };

    xhr.ontimeout = function() {
      showLoadFailure();
    };

    xhr.send();
  }

  function showLoadFailure() {
    picturesContainer.classList.add('pictures-failure');
  }

  /**
   * Handle chosen filter
   * @param {string} filterValue
   */
  function setActiveFilter(filterValue) {
    var filteredPictures = pictures.slice(0);
    filteredPictures = filterPictures(filteredPictures, filterValue);
    renderPictures(filteredPictures);
  }

  /**
   * Change the display order of pictures:
   * new - pictures are not older than 30 days + desc order by date
   * discussed - desc order by comments
   * @param {Object} filteredPictures
   * @param {String} filterValue
   * @return {Object}
   */
  function filterPictures(filteredPictures, filterValue) {
    switch (filterValue) {
      case 'new':
        filteredPictures = filteredPictures.filter(function(item) {
          var diffInDays = Math.round((dateNow - new Date(item.date)) / MILLISECONDS_IN_DAY);
          return diffInDays <= 30 && diffInDays > 0;
        })
        .sort(function(a, b) {
          var dateA = new Date(a.date), dateB = new Date(b.date);
          return compareElements(dateB, dateA);
        });
        break;

      case 'discussed':
        filteredPictures = filteredPictures.sort(function(a, b) {
          return compareElements(b.comments, a.comments);
        });
        break;

      default:
        break;
    }
    return filteredPictures;
  }

  /**
   * Display pictures
   * @param {Object} pictures
   */
  function renderPictures(pictures) {
    picturesContainer.classList.remove('pictures-failure');
    picturesContainer.innerHTML = '';

    var pictureTemplate = document.getElementById('picture-template');
    var picturesFragment = document.createDocumentFragment();

    pictures.forEach(function(picture) {
      var newPictureElement = pictureTemplate.content.children[0].cloneNode(true);

      newPictureElement.querySelector('.picture-comments').textContent = picture['comments'];
      newPictureElement.querySelector('.picture-likes').textContent = picture['likes'];

      picturesFragment.appendChild(newPictureElement);

      var oldImg = newPictureElement.querySelector('img');

      if (!picture['url']) {
        newPictureElement.classList.add('picture-load-failure');
        return;
      }

      var newImg = new Image();
      newImg.src = picture['url'];
      newImg.width = 182;
      newImg.height = 182;

      newImg.onload = function() {
        newPictureElement.replaceChild(newImg, oldImg);
      };

      newImg.onerror = function() {
        newPictureElement.classList.add('picture-load-failure');
      };
    });

    picturesContainer.appendChild(picturesFragment);
  }

  /**
   * Compare elements for sort func.
   * @param {number} elem1
   * @param {number} elem2
   * @return {number} 1 or -1 or 0
   */
  function compareElements(elem1, elem2) {
    return (elem1 - elem2) / Math.abs(elem1 - elem2) || 0;
  }

})();
