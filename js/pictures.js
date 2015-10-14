/* global Photo: true Gallery: true */

'use strict';

(function() {
  /**
   * @readonly
   * @enum {number}
   */
  var XHR_STATE = {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4
  };

  /**
   * @const
   * @type {number}
   */
  var REQUEST_FAILURE_TIMEOUT = 10000;

  /**
   * @const
   * @type {number}
   */
  var MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

  /**
   * Number of pictures (photos) which are shown after load page on desktop screen.
   * @const
   * @type {number}
   */
  var PICTURES_ON_PAGE = 12;

  /**
   * Number of pictures (photos) which are shown after load page on
   * touch screen (or on desktop screen if screen width less than 1380).
   * @const
   * @type {number}
   */
  var PICTURES_ON_PAGE_TABLET = 11;

  /**
   * Number of pictures (photos) in each line which are shown after
   * scroll or resize on desktop screen.
   * @const
   * @type {number}
   */
  var PICTURES_IN_LINE = 7;

  /**
   * Number of pictures (photos) in each line which are shown after
   * scroll or resize on touch screen (or on desktop screen if screen width less than 1380).
   * @const
   * @type {number}
   */
  var PICTURES_IN_LINE_TABLET = 5;

  /**
   * @const
   * @type {number}
   */
  var SCREEN_WIDTH = 1380;

  /**
   * @type {Date}
   */
  var dateNow = new Date();

  /**
   * @type {Element}
   */
  var picturesContainer = document.querySelector('.pictures');

  /**
   * @type {Element}
   */
  var filtersBlock = document.querySelector('.filters');

  /**
   * @type {string}
   */
  var hiddenFiltersClass = 'hidden';

  /**
   * The initial list of downloaded data from the json file
   * @type {Array.<Object>}
   */
  var pictures;

  /**
   * Current rendered list of pictures on the page.
   * It differs from pictures in that it might be filtered at the moment.
   * @type {Array.<Object>}
   */
  var currentPictures;

  /**
   * Number of pictures with which to start render
   * @type {number}
   */
  var picturesRenderTo = 0;

  /**
   * Width that was before resize window. It helps to figure out
   * if the window was resized from tablet screen to desktop screen
   * or from desktop screen to tablet screen
   * @type {Number}
   */
  var windowWidth = window.innerWidth;

  /**
   * The list of rendered pictures.
   * It is used to access each of the Photos to remove it from the page.
   * @type {Array.<Photo>}
   */
  var renderedPictures = [];

  /**
   * The list of photos url which is used to be shown in gallery.
   * @type {Array.<string>}
   */
  var photosUrl = [];

  /**
   * @type {Gallery}
   */
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
   * @param {Array.<Object>} loadedPictures
   */
  function loadPicturesCallback(loadedPictures) {
    pictures = loadedPictures;
    setActiveFilter(localStorage.getItem('filterValue') || 'popular');
  }

  /**
   * Hide block of filters.
   */
  function hideFilter() {
    filtersBlock.classList.add(hiddenFiltersClass);
  }

  /**
   * Show block of filters.
   */
  function showFilter() {
    filtersBlock.classList.remove(hiddenFiltersClass);
  }

  /**
   * It creates delegate events on their block of filters.
   */
  function initFilters() {
    filtersBlock.addEventListener('click', function(event) {
      var clickedFilter = event.target;

      if (doesHaveParent(clickedFilter, 'filters-radio')) {
        localStorage.setItem('filterValue', clickedFilter.value);
        setActiveFilter(clickedFilter.value);
      }
    });
  }

  /**
   * It creates two event handler. Custom event (loadneeded) triggered,
   * when there is an empty space for new pictures.
   */
  function initScroll() {
    var timeout;
    window.addEventListener('scroll', function() {
      clearTimeout(timeout);
      timeout = setTimeout(loadNextPictures, 100);
    });

    window.addEventListener('loadneeded', function() {
      renderPictures(currentPictures, countOfPicturesNeedToRender(false), false);
    });
  }

  /**
   * It creates four event handler, three of them - custom.
   * Custom event (resizeWindowHeight) triggered, when window resized on height
   * and there is an empty space for new pictures.
   */
  function initResizeWindow() {
    var timeout;
    window.addEventListener('resize', function() {
      clearTimeout(timeout);
      timeout = setTimeout(loadPicturesDueToResize, 66);
    });

    window.addEventListener('resizeWindowToDesktopWidth', function() {
      var countPicturesAdd = countOfPicturesNeedToAdd(PICTURES_ON_PAGE, PICTURES_IN_LINE);
      if (countPicturesAdd) {
        renderPictures(currentPictures, countPicturesAdd, false);
        extraRenderPictures();
      }
    });

    window.addEventListener('resizeWindowToTabletWidth', function() {
      var countPicturesAdd = countOfPicturesNeedToAdd(PICTURES_ON_PAGE_TABLET, PICTURES_IN_LINE_TABLET);
      if (countPicturesAdd) {
        renderPictures(currentPictures, countPicturesAdd, false);
        extraRenderPictures();
      }
    });

    window.addEventListener('resizeWindowHeight', function() {
      extraRenderPictures();
    });
  }

  /**
   * It creates Custom Event - photoclick, which is dispatch by Window object in object Photo
   * if there was a click on the photos.
   */
  function initGallery() {
    window.addEventListener('photoclick', function(event) {
      var indexCurrentPhoto = photosUrl.indexOf(event.detail.photoUrl);
      gallery.setCurrentPhoto(indexCurrentPhoto);
      gallery.show();
    });
  }

  /**
   * Fill array with the list of photos url for gallery.
   */
  function setPhotosUrl() {
    photosUrl = [];
    currentPictures.forEach(function(item) {
      photosUrl.push(item['url']);
    });
  }

  /**
   * Check if element or one of its parents has a class - className.
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

  /**
   * Check if the scroll almost at the bottom of the page (-100px).
   * @returns {boolean}
   */
  function isAtTheBottom() {
    var GAP = 100;
    return picturesContainer.getBoundingClientRect().bottom - GAP <= window.innerHeight;
  }

  /**
   * If it has more pictures to show.
   * @returns {boolean}
   */
  function hasMorePicturesToShow() {
    return picturesRenderTo < currentPictures.length;
  }

  /**
   * Check how many pictures available to show.
   * @returns {number}
   */
  function countOfAvailablePictures() {
    return currentPictures.length - picturesRenderTo;
  }

  /**
   * Dispatch event if there is an empty space for new pictures
   * and it has more pictures to show.
   */
  function loadNextPictures() {
    if (isAtTheBottom() && hasMorePicturesToShow()) {
      window.dispatchEvent(new CustomEvent('loadneeded'));
    }
  }

  /**
   * Check if current device is touch or not.
   * @returns {boolean}
   */
  function isTouchDevice() {
    return 'ontouchstart' in window     // works on most browsers
      || 'onmsgesturechange' in window; // works on ie10, but with bugs
  }

  /**
   * Is window width was less than desktop screen? -> tablet.
   * @returns {boolean}
   */
  function isWindowWidthWasNarrow() {
    return windowWidth < SCREEN_WIDTH;
  }

  /**
   * Is window width was more or equal to desktop width? -> desktop.
   * @returns {boolean}
   */
  function isWindowWidthWasWide() {
    return windowWidth >= SCREEN_WIDTH;
  }

  /**
   * Is window width now more or equal to desktop width? -> desktop.
   * @returns {boolean}
   */
  function isWindowWidthWideNow() {
    return window.innerWidth >= SCREEN_WIDTH;
  }

  /**
   * Is window width now less than desktop screen? -> tablet.
   * @returns {boolean}
   */
  function isWindowWidthNarrowNow() {
    return window.innerWidth < SCREEN_WIDTH;
  }

  /**
   * Save current window width.
   */
  function storeWindowWidth() {
    windowWidth = window.innerWidth;
  }

  /**
   * Load pictures if there is an empty space for them
   */
  function loadPicturesDueToResize() {
    if (hasMorePicturesToShow()) {
      if (isWindowWidthWasNarrow() && isWindowWidthWideNow()) {
        storeWindowWidth();
        window.dispatchEvent(new CustomEvent('resizeWindowToDesktopWidth'));
      } else if (isWindowWidthWasWide() && isWindowWidthNarrowNow()) {
        storeWindowWidth();
        window.dispatchEvent(new CustomEvent('resizeWindowToTabletWidth'));
      } else if (isPicturesContainerShort()) {
        window.dispatchEvent(new CustomEvent('resizeWindowHeight'));
      }
    }
  }

  /**
   * How many pictures need to show to fill an empty space?
   * @param {number} picturesOnPage
   * @param {number} picturesInLine
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
   * How many pictures should be rendered?
   * @param {boolean} pageUpdated - true: use count pictures on page; false: use count pictures in line
   * @returns {number}
   */
  function countOfPicturesNeedToRender(pageUpdated) {
    pageUpdated = typeof pageUpdated === 'undefined' ? true : pageUpdated;
    var countPictures = countOfAvailablePictures();
    var countPicturesToRender;

    if (!countPictures) {
      return countPictures;
    }

    if (isTouchDevice()) {
      countPicturesToRender = pageUpdated ? PICTURES_ON_PAGE_TABLET : PICTURES_IN_LINE_TABLET;
      return (countPictures < countPicturesToRender) ? countPictures : countPicturesToRender;
    }

    if (pageUpdated) {
      countPicturesToRender = isWindowWidthWideNow() ? PICTURES_ON_PAGE : PICTURES_ON_PAGE_TABLET;
    } else {
      countPicturesToRender = isWindowWidthWideNow() ? PICTURES_IN_LINE : PICTURES_IN_LINE_TABLET;
    }

    return (countPictures < countPicturesToRender) ? countPictures : countPicturesToRender;
  }

  /**
   * Is pictures container shorter than height of viewport?
   * @returns {boolean}
   */
  function isPicturesContainerShort() {
    return window.innerHeight > picturesContainer.getBoundingClientRect().bottom;
  }

  /**
   * Load extra pictures if pictures container shorter than height of viewport
   * and if it has more pictures to show.
   */
  function extraRenderPictures() {
    while (hasMorePicturesToShow() && isPicturesContainerShort()) {
      renderPictures(currentPictures, countOfPicturesNeedToRender(false), false);
    }
  }

  /**
   * Load the list of pictures.
   * If pictures received successfully -> callback is called.
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

  /**
   * If pictures are not received successfully - show failure picture
   */
  function showLoadFailure() {
    picturesContainer.classList.add('pictures-failure');
  }

  /**
   * Handling of chosen filter
   * @param {string} filterValue
   */
  function setActiveFilter(filterValue) {
    currentPictures = filterPictures(filterValue);
    setPhotosUrl();
    gallery.setPhotos(photosUrl);
    picturesRenderTo = 0;
    highlightCheckedFilter(filterValue);

    renderPictures(currentPictures, countOfPicturesNeedToRender(true), true);
    extraRenderPictures();
  }

  /**
   * Set last checked filter to true (highlight it)
   * @param {string} filterValue
   */
  function highlightCheckedFilter(filterValue) {
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
   * @param {string} filterValue
   * @return {Array.<Object>}
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
   * Display list of pictures on the page
   * @param {Array.<Object>} picturesToRender
   * @param {number} picturesCount
   * @param {boolean} replace - true: update all pictures; false: add new pictures line below
   */
  function renderPictures(picturesToRender, picturesCount, replace) {
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
    picturesToRender = picturesToRender.slice(picturesRenderFrom, picturesRenderTo);

    picturesToRender.forEach(function(pictureData) {
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
