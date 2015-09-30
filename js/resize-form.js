"use strict";

(function() {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = resizeForm.querySelector('.resize-image-preview');
  var prevButton = resizeForm['resize-prev'];

  var displacementX = resizeForm['resize-x'];
  var displacementY = resizeForm['resize-y'];
  var side = resizeForm['resize-size'];

  // initial values. if side.value will be more than image - it will be corrected in onsubmit event
  displacementX.value = 0;
  displacementY.value = 0;
  side.value = 50;

  displacementX.min = 0;
  displacementY.min = 0;
  side.min = 50;


  function getValue(elem) {
    return +elem.value;
  }

  function getMax(elem) {
    return +elem.max;
  }

  function getMin(elem) {
    return +elem.min;
  }

  displacementX.onchange = function() {
    if (!getMax(displacementX)
      || getValue(displacementX) > getMax(displacementX)
      || getValue(displacementX) < getMin(displacementX)) {
      setDisplacement();
    }

    setSide();
  };

  displacementY.onchange = function() {
    if (getMax(displacementY)
      || getValue(displacementY) > getMax(displacementY)
      || getValue(displacementY) < getMin(displacementY)) {
      setDisplacement();
    }

    setSide();
  };

  side.onchange = function() {
    if (!getMax(side)
      || getValue(side) > getMax(side)
      || getValue(side) < getMin(side)) {
      setSide();
    }

    setDisplacement();
  };

  prevButton.onclick = function(evt) {
    evt.preventDefault();

    resizeForm.reset();
    uploadForm.reset();
    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();

    if (sideIsValid() && displacementIsValid()) {
      console.dir(filterForm);
      filterForm.elements['filter-image-src'].src = previewImage.src;
      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  };

  /**
   * Set max and value for displacementX and displacementY parameters
   */
  function setDisplacement() {
    displacementX.max = Math.max(previewImage.naturalWidth - getValue(side), 0);
    displacementY.max = Math.max(previewImage.naturalHeight - getValue(side), 0);

    if (getValue(displacementX) > getMax(displacementX)) {
      displacementX.value = getMax(displacementX);
    }
    else if (getValue(displacementX) < getMin(displacementX)) {
      displacementX.value = getMin(displacementX);
    }

    if (getValue(displacementY) > getMax(displacementY)) {
      displacementY.value = getMax(displacementY);
    }
    else if (getValue(displacementY) < getMin(displacementY)) {
      displacementY.value = getMin(displacementY);
    }
  }

  function displacementIsValid() {
    if (!getMax(displacementX) || !getMax(displacementY)) {
      setDisplacement();
    }

    return getValue(displacementX) <= getMax(displacementX) && getValue(displacementY) <= getMax(displacementY);
  }

  /**
   * Set max and valu for side parameter
   */
  function setSide() {
    side.max = Math.min(
      previewImage.naturalWidth - getValue(displacementX),
      previewImage.naturalHeight - getValue(displacementY));

    if (getValue(side) > getMax(side)) {
      side.value = Math.max(getMax(side), getMin(side));
    }
    else if (getValue(side) < getMin(side)) {
      side.value = Math.min(getMax(side), getMin(side));
    }
  }

  function sideIsValid() {
    if (!getMax(side)) {
      setSide();
    }

    return getValue(side) <= getMax(side);
  }

})();
