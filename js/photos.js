'use strict';

requirejs.config({
  baseUrl: 'js'
});

define([
  'gallery',
  'models/photos',
  'views/photo',
  'logo-background',
  'upload-form',
  'filter-form'
], function(Gallery, PhotosCollection, PhotoView) {
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
   * Number of photos which are shown after load page on desktop screen.
   * @const
   * @type {number}
   */
  var PHOTOS_ON_PAGE = 12;

  /**
   * Number of photos which are shown after load page on
   * touch screen (or on desktop screen if screen width less than 1380).
   * @const
   * @type {number}
   */
  var PHOTOS_ON_PAGE_TABLET = 11;

  /**
   * Number of photos in each line which are shown after
   * scroll or resize on desktop screen.
   * @const
   * @type {number}
   */
  var PHOTOS_IN_LINE = 7;

  /**
   * Number of photos in each line which are shown after
   * scroll or resize on touch screen (or on desktop screen if screen width less than 1380).
   * @const
   * @type {number}
   */
  var PHOTOS_IN_LINE_TABLET = 5;

  /**
   * @const
   * @type {number}
   */
  var SCREEN_WIDTH = 1380;

  /**
   * @const
   * @type {number}
   */
  var GAP = 100;

  /**
   * @type {Date}
   */
  var now = new Date();

  /**
   * @type {Element}
   */
  var photosContainer = document.querySelector('.pictures');

  /**
   * @type {Element}
   */
  var pictureTemplate = document.getElementById('picture-template');

  /**
   * @type {Element}
   */
  var filtersBlock = document.querySelector('.filters');

  /**
   * @type {string}
   */
  var hiddenFiltersClass = 'hidden';

  /**
   * Number of photos with which to start render
   * @type {number}
   */
  var photosRenderTo = 0;

  /**
   * Width that was before resize window. It helps to figure out
   * if the window was resized from tablet screen to desktop screen
   * or from desktop screen to tablet screen
   * @type {Number}
   */
  var windowWidth = window.innerWidth;

  /**
   * Backbone Collection with all models which are used to be shown in gallery.
   * @type {Backbone.Collection}
   */
  var fullPhotosCollection = new Backbone.Collection();

  /**
   * @type {Gallery}
   */
  var gallery = new Gallery();

  /**
   * @type {PhotosCollection}
   */
  var photosCollection = new PhotosCollection();

  /**
   * @type {Array.<Object>}
   */
  var initiallyLoaded = [];

  /**
   * The list of rendered photos.
   * It is used to access each of the Photos to remove it from the page.
   * @type {Array.<PhotoView>}
   */
  var renderedViews = [];


  photosCollection.fetch({ timeout: REQUEST_FAILURE_TIMEOUT })
    .success(function(loaded, state, jqXHR) {
      initiallyLoaded = jqXHR.responseJSON;
      hideFilter();
      initFilters();
      initScroll();
      initResizeWindow();

      setActiveFilter(parseURL());
      showFilter();
    })
    .fail(function() {
      showLoadFailure();
    });

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
        location.hash = 'filters/' + clickedFilter.value;
      }
    });
    window.addEventListener('hashchange', function() {
      setActiveFilter(parseURL());
    });
  }

  /**
   * It creates two event handler. Custom event (hitTheBottom) triggered,
   * when there is an empty space for new photos.
   */
  function initScroll() {
    var timeout;
    window.addEventListener('scroll', function() {
      clearTimeout(timeout);
      timeout = setTimeout(loadNextPhotos, 100);
    });

    window.addEventListener('hitTheBottom', function() {
      renderPhotos(countPhotosNeedToRender(false), false);
    });
  }

  /**
   * It creates four event handler, three of them - custom.
   * Custom event (resizeWindowHeight) triggered, when window resized on height
   * and there is an empty space for new photos.
   */
  function initResizeWindow() {
    var timeout;
    window.addEventListener('resize', function() {
      clearTimeout(timeout);
      timeout = setTimeout(loadPhotosDueToResize, 66);
    });

    window.addEventListener('resizeWindowToDesktopWidth', function() {
      var countPhotosAdd = countPhotosNeedToAdd(PHOTOS_ON_PAGE, PHOTOS_IN_LINE);
      if (countPhotosAdd) {
        renderPhotos(countPhotosAdd, false);
        while (isThereFreeSpaceForPhotos()) {
          renderPhotos(countPhotosNeedToRender(false), false);
        }
      }
    });

    window.addEventListener('resizeWindowToTabletWidth', function() {
      var countPhotosAdd = countPhotosNeedToAdd(PHOTOS_ON_PAGE_TABLET, PHOTOS_IN_LINE_TABLET);
      if (countPhotosAdd) {
        renderPhotos(countPhotosAdd, false);
        while (isThereFreeSpaceForPhotos()) {
          renderPhotos(countPhotosNeedToRender(false), false);
        }
      }
    });

    window.addEventListener('resizeWindowHeight', function() {
      while (isThereFreeSpaceForPhotos()) {
        renderPhotos(countPhotosNeedToRender(false), false);
      }
    });
  }

  /**
   * Parse hash of url to activate one of filters
   * @returns {Array.<string>|string}
   */
  function parseURL() {
    var match = location.hash.match(/^#filters\/(\S+)$/);
    return match ? match[1] : 'popular';
  }

  /**
   * Fill Backbone collection with the list of photos models for gallery.
   */
  function fillPhotosCollection() {
    photosCollection.forEach(function(model) {
      var view = new PhotoView({ model: model });
      fullPhotosCollection.add(view.model);
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
   * Check if the scroll almost at the bottom of the page.
   * @returns {boolean}
   */
  function isAtTheBottom() {
    return photosContainer.getBoundingClientRect().bottom - GAP <= window.innerHeight;
  }

  /**
   * Check how many photos available to show.
   * @returns {number}
   */
  function countAvailablePhotos() {
    return photosCollection.length - photosRenderTo;
  }

  /**
   * Dispatch event if there is an empty space for new photos
   * and it has more photos to show.
   */
  function loadNextPhotos() {
    if (isAtTheBottom() && countAvailablePhotos() > 0) {
      window.dispatchEvent(new CustomEvent('hitTheBottom'));
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
   * Load photos if there is an empty space for them
   */
  function loadPhotosDueToResize() {
    if (countAvailablePhotos() > 0) {
      if (isWindowWidthWasNarrow() && isWindowWidthWideNow()) {
        storeWindowWidth();
        window.dispatchEvent(new CustomEvent('resizeWindowToDesktopWidth'));
      } else if (isWindowWidthWasWide() && isWindowWidthNarrowNow()) {
        storeWindowWidth();
        window.dispatchEvent(new CustomEvent('resizeWindowToTabletWidth'));
      } else if (isPhotosContainerShort()) {
        window.dispatchEvent(new CustomEvent('resizeWindowHeight'));
      }
    }
  }

  /**
   * How many photos need to show in order to fill an empty space?
   * @param {number} photosOnPage
   * @param {number} photosInLine
   * @returns {number}
   */
  function countPhotosNeedToAdd(photosOnPage, photosInLine) {
    var photosOnPageNow = photosContainer.querySelectorAll('.picture').length;
    var pendingPhotos = photosOnPage - photosOnPageNow;
    if (pendingPhotos > 0) {
      return pendingPhotos;
    }
    pendingPhotos = -pendingPhotos % photosInLine;
    return pendingPhotos ? photosInLine - pendingPhotos : pendingPhotos;
  }

  /**
   * How many photos should be rendered?
   * @param {boolean} pageUpdated - true: use count photos on page; false: use count photos in line
   * @returns {number}
   */
  function countPhotosNeedToRender(pageUpdated) {
    var countPhotos = countAvailablePhotos();
    var countPhotosToRender;

    if (!countPhotos) {
      return countPhotos;
    }

    if (isTouchDevice()) {
      countPhotosToRender = pageUpdated ? PHOTOS_ON_PAGE_TABLET : PHOTOS_IN_LINE_TABLET;
      return (countPhotos < countPhotosToRender) ? countPhotos : countPhotosToRender;
    }

    if (pageUpdated) {
      countPhotosToRender = isWindowWidthWideNow() ? PHOTOS_ON_PAGE : PHOTOS_ON_PAGE_TABLET;
    } else {
      countPhotosToRender = isWindowWidthWideNow() ? PHOTOS_IN_LINE : PHOTOS_IN_LINE_TABLET;
    }

    return (countPhotos < countPhotosToRender) ? countPhotos : countPhotosToRender;
  }

  /**
   * Is photos container shorter than height of viewport?
   * @returns {boolean}
   */
  function isPhotosContainerShort() {
    return window.innerHeight > photosContainer.getBoundingClientRect().bottom;
  }

  /**
   * @returns {boolean}
   */
  function isThereFreeSpaceForPhotos() {
    return countAvailablePhotos() > 0 && isPhotosContainerShort();
  }

  /**
   * If photos are not received successfully - show failure picture
   */
  function showLoadFailure() {
    photosContainer.classList.add('pictures-failure');
  }

  /**
   * Handling of chosen filter
   * @param {string} filterValue
   */
  function setActiveFilter(filterValue) {
    filterPhotos(filterValue);
    photosRenderTo = 0;
    fillPhotosCollection();

    renderPhotos(countPhotosNeedToRender(true), true);
    highlightCheckedFilter(filterValue);

    while (isThereFreeSpaceForPhotos()) {
      renderPhotos(countPhotosNeedToRender(false), false);
    }
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
   * Change the display order of photos:
   * new - photos are not older than 30 days + desc order by date
   * discussed - desc order by comments
   * @param {string} filterValue
   */
  function filterPhotos(filterValue) {
    var list = initiallyLoaded.slice(0);
    switch (filterValue) {
      case 'new':
        list = list.filter(function(item) {
          var diffInDays = Math.round((now - new Date(item.date)) / MILLISECONDS_IN_DAY);
          return diffInDays <= 30 && diffInDays > 0;
        })
        .sort(function(a, b) {
          var dateA = new Date(a.date), dateB = new Date(b.date);
          return compareElements(dateB, dateA);
        });
        break;

      case 'discussed':
        list.sort(function(a, b) {
          return compareElements(b.comments, a.comments);
        });
        break;
    }
    photosCollection.reset(list);
  }

  /**
   * Display list of photos on the page
   * @param {number} photosCount
   * @param {boolean} replace - true: update all photos; false: add new photos line below
   */
  function renderPhotos(photosCount, replace) {
    var fragment = document.createDocumentFragment();
    var photosRenderFrom = photosRenderTo;
    photosRenderTo = photosRenderFrom + photosCount;

    if (replace) {
      while (renderedViews.length) {
        var viewToRemove = renderedViews.shift();
        photosContainer.removeChild(viewToRemove.el);
        viewToRemove.off('photoclick');
        viewToRemove.remove();
      }
    }

    photosCollection.slice(photosRenderFrom, photosRenderTo).forEach(function(model) {

      var view = new PhotoView({ model: model });
      view.setElement(pictureTemplate.content.children[0].cloneNode(true));
      view.render();
      fragment.appendChild(view.el);
      renderedViews.push(view);

      view.on('photoclick', function() {
        gallery.setPhotos(fullPhotosCollection);
        gallery.setCurrentPhoto(fullPhotosCollection.models.indexOf(view.model));
        gallery.show();
      });
    });

    photosContainer.appendChild(fragment);
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
});
