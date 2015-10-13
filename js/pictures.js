/* global Photo: true Gallery: true */

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
  var PICTURES_ON_PAGE = 12;
  var PICTURES_ON_PAGE_TABLET = 11;
  var PICTURES_IN_LINE = 7;
  var PICTURES_IN_LINE_TABLET = 5;
  var SCREEN_WIDTH = 1380;

  var dateNow = new Date();
  var picturesContainer = document.querySelector('.pictures');
  var filtersBlock = document.querySelector('.filters');
  var hiddenFilters = 'hidden';
  var pictures;
  var currentPictures;
  var picturesRenderTo = 0;
  var windowWidth = window.innerWidth;

  var renderedPictures = [];

  var gallery = new Gallery();

  hideFilter();
  initFilters();

  loadPictures(loadPicturesCallback);

  initScroll();
  initResizeWindow();
  initGallery();
  showFilter();

  /**
   * @callback loadPicturesCallback
   * @param {Object} loadedPictures
   */
  function loadPicturesCallback(loadedPictures) {
    pictures = loadedPictures;
    setActiveFilter(localStorage.getItem('filterValue') || 'popular');
  }

  function hideFilter() {
    filtersBlock.classList.add(hiddenFilters);
  }

  function showFilter() {
    filtersBlock.classList.remove(hiddenFilters);
  }

  function initFilters() {
    filtersBlock.addEventListener('click', function(event) {
      var clickedFilter = event.target;

      if (doesHaveParent(clickedFilter, 'filters-radio')) {
        localStorage.setItem('filterValue', clickedFilter.value);
        setActiveFilter(clickedFilter.value);
      }
    });
  }

  function initScroll() {
    var timeout;
    window.addEventListener('scroll', function() {
      clearTimeout(timeout);
      timeout = setTimeout(loadNextPictures, 100);
    });

    window.addEventListener('loadneeded', function() {
      renderPictures(currentPictures, countOfRenderPictures(false), false);
    });
  }

  function initResizeWindow() {
    var timeout;
    window.addEventListener('resize', function() {
      clearTimeout(timeout);
      timeout = setTimeout(loadPicturesDueToResize, 66);
    });

    window.addEventListener('resizeWidthToDesktop', function() {
      var countPicturesAdd = countOfPicturesNeedToAdd(PICTURES_ON_PAGE, PICTURES_IN_LINE);
      if (countPicturesAdd) {
        renderPictures(currentPictures, countPicturesAdd, false);
        extraRenderPictures();
      }
    });

    window.addEventListener('resizeWidthToTablet', function() {
      var countPicturesAdd = countOfPicturesNeedToAdd(PICTURES_ON_PAGE_TABLET, PICTURES_IN_LINE_TABLET);
      if (countPicturesAdd) {
        renderPictures(currentPictures, countPicturesAdd, false);
        extraRenderPictures();
      }
    });

    window.addEventListener('resizeHeight', function() {
      extraRenderPictures();
    });
  }

  function initGallery() {
    window.addEventListener('galleryclick', function(event) {
      var photos = getAllPhotosUrl();
      gallery.setPhotos(photos);

      var indexCurrentPhoto = photos.indexOf(event.detail.photoUrl);
      gallery.setCurrentPhoto(indexCurrentPhoto);
      gallery.show();
    });
  }

  function getAllPhotosUrl() {
    var photosUrl = [];
    currentPictures.forEach(function(item) {
      photosUrl.push(item['url']);
    });
    return photosUrl;
  }

  /**
   * Check if element has a class - className
   * @param {Object} element
   * @param {string} className
   * @returns {boolean}
   */
  function doesHaveParent(element, className) {
    do {
      if (element.classList.contains(className)) {
        return true;
      }
      element = element.parentElement;
    } while (element);
    return false;
  }

  function isAtTheBottom() {
    var GAP = 100;
    return picturesContainer.getBoundingClientRect().bottom - GAP <= window.innerHeight;
  }

  function haveAnyAvailablePictures() {
    return picturesRenderTo < currentPictures.length;
  }

  function countOfAvailablePictures() {
    return currentPictures.length - picturesRenderTo;
  }

  function loadNextPictures() {
    if (isAtTheBottom() && haveAnyAvailablePictures()) {
      window.dispatchEvent(new CustomEvent('loadneeded'));
    }
  }

  function isTablet() {
    return windowWidth < SCREEN_WIDTH;
  }

  function updateWindowWidth() {
    windowWidth = window.innerWidth;
  }

  function loadPicturesDueToResize() {
    if (haveAnyAvailablePictures()) {
      if (isTablet() && window.innerWidth >= SCREEN_WIDTH) {
        updateWindowWidth();
        window.dispatchEvent(new CustomEvent('resizeWidthToDesktop'));
      } else if (!isTablet() && window.innerWidth < SCREEN_WIDTH) {
        updateWindowWidth();
        window.dispatchEvent(new CustomEvent('resizeWidthToTablet'));
      } else if (isPicturesContainerShort()) {
        window.dispatchEvent(new CustomEvent('resizeHeight'));
      }
    }
  }

  /**
   * How many pictures need to fill empty cells resize of window
   * @param {Number} picturesOnPage
   * @param {Number} picturesInLine
   * @returns {number}
   */
  function countOfPicturesNeedToAdd(picturesOnPage, picturesInLine) {
    var picturesOnPageNow = picturesContainer.querySelectorAll('.picture').length;
    if (picturesOnPageNow < picturesOnPage) {
      return picturesOnPage - picturesOnPageNow;
    } else {
      var value = (picturesOnPageNow - picturesOnPage) % picturesInLine;
      return value ? picturesInLine - value : value;
    }
  }

  /**
   * How many pictures need to render
   * @param {Boolean} replace - true: update pictures on page; false: add new line of pictures below
   * @returns {Number}
   */
  function countOfRenderPictures(replace) {
    replace = (typeof (replace) === 'undefined') ? true : replace;
    var countPictures = countOfAvailablePictures();
    var countPicturesToRender;

    if (!countPictures) {
      return countPictures;
    }

    if (replace) {
      countPicturesToRender = (window.innerWidth >= SCREEN_WIDTH) ? PICTURES_ON_PAGE : PICTURES_ON_PAGE_TABLET;
    } else {
      countPicturesToRender = (window.innerWidth >= SCREEN_WIDTH) ? PICTURES_IN_LINE : PICTURES_IN_LINE_TABLET;
    }

    return (countPictures < countPicturesToRender) ? countPictures : countPicturesToRender;
  }

  function isPicturesContainerShort() {
    return window.innerHeight > picturesContainer.getBoundingClientRect().bottom;
  }

  /**
   * Load extra pictures if pictures container shorter than height of viewport
   */
  function extraRenderPictures() {
    while (haveAnyAvailablePictures() && isPicturesContainerShort()) {
      renderPictures(currentPictures, countOfRenderPictures(false), false);
    }
  }

  /**
   * Send a request if pictures received successfully
   * @param {loadPicturesCallback} callback - The callback that handles the response
   */
  function loadPictures(callback) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = REQUEST_FAILURE_TIMEOUT;
    xhr.open('get', 'data/pictures.json');

    xhr.addEventListener('readystatechange', function(event) {
      var loadedXhr = event.target;

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
    });

    xhr.addEventListener('timeout', function() {
      showLoadFailure();
    });

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
    currentPictures = filterPictures(filterValue);
    picturesRenderTo = 0;

    setCheckedFilter(filterValue);

    renderPictures(currentPictures, countOfRenderPictures(true), true);
    extraRenderPictures();
  }

  /**
   * Set last checked filter, which loaded from LocalStorage after update page
   * @param {string} filterValue
   */
  function setCheckedFilter(filterValue) {
    var checkedFilter = filtersBlock.querySelector('input:checked');
    if (checkedFilter.value !== filterValue) {
      var notCheckedFilters = filtersBlock.querySelectorAll('input:not(:checked)');
      for (var i = 0; i < notCheckedFilters.length; i++) {
        if (notCheckedFilters[i].value === filterValue) {
          notCheckedFilters[i].checked = true;
          break;
        }
      }
    }
  }

  /**
   * Change the display order of pictures:
   * new - pictures are not older than 30 days + desc order by date
   * discussed - desc order by comments
   * @param {String} filterValue
   * @return {Object} filteredPictures
   */
  function filterPictures(filterValue) {
    var filteredPictures = pictures.slice(0);
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
   * @param {Object} picturesNeedToRender
   * @param {Number} picturesCount
   * @param {Boolean} replace - true: update all pictures; false: add new pictures below
   */
  function renderPictures(picturesNeedToRender, picturesCount, replace) {
    replace = typeof replace !== 'undefined' ? replace : true;

    if (replace) {
      var elem;
      while ((elem = renderedPictures.shift())) {
        elem.unrender();
      }

      picturesContainer.classList.remove('pictures-failure');
    }

    var picturesFragment = document.createDocumentFragment();

    var picturesRenderFrom = picturesRenderTo;
    picturesRenderTo = picturesRenderFrom + picturesCount;
    picturesNeedToRender = picturesNeedToRender.slice(picturesRenderFrom, picturesRenderTo);

    picturesNeedToRender.forEach(function(pictureData) {
      var newPictureElement = new Photo(pictureData);
      newPictureElement.render(picturesFragment);
      renderedPictures.push(newPictureElement);
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
