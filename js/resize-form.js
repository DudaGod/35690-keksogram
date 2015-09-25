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

  displacementX.onchange = function() {
    if (!displacementX.max || +displacementX.value > +displacementX.max) {
      setDisplacement();
    }

    setSide();
  };

  displacementY.onchange = function() {
    if (!displacementY.max || +displacementY.value > +displacementY.max) {
      setDisplacement();
    }

    setSide();
  };

  side.onchange = function() {
    if (!side.max || +side.value > +side.max) {
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

    if(sideIsValid() && displacementIsValid()) {
      filterForm.elements['filter-image-src'] = previewImage.src;
      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  };


  function setDisplacement() {
    displacementX.max = Math.max(previewImage.naturalWidth - side.value, 0);
    displacementY.max = Math.max(previewImage.naturalHeight - side.value, 0);

    if (+displacementX.value > +displacementX.max) {
      displacementX.value = displacementX.max;
    }

    if (+displacementY.value > +displacementY.max) {
      displacementY.value = displacementY.max;
    }
  }

  function displacementIsValid() {
    if (!displacementX.max || !displacementY.max) {
      setDisplacement();
    }

    return +displacementX.value <= +displacementX.max && +displacementY.value <= +displacementY.max;
  }

  function setSide() {
    side.max = Math.min(
      previewImage.naturalWidth - displacementX.value,
      previewImage.naturalHeight - displacementY.value);

    if (+side.value > +side.max) {
      side.value = Math.max(side.max, side.min);
    }
  }

  function sideIsValid() {
    if(!side.max) {
      setSide();
    }

    return +side.value <= +side.max;
  }

})();
