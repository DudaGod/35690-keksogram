(function() {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = resizeForm.querySelector('.resize-image-preview');
  var prevButton = resizeForm['resize-prev'];

  var MIN_SIDE_SIZE = 50;

  var resizeX = resizeForm['resize-x'];
  var resizeY = resizeForm['resize-y'];
  var resizeSide = resizeForm['resize-size'];

  resizeX.min = 0;
  resizeY.min = 0;
  resizeSide.min = MIN_SIDE_SIZE;

  resizeX.onchange = function(evt) {
    var sideReduction = resizeSide.value || MIN_SIDE_SIZE;
    resizeX.max = previewImage.width - sideReduction;
  };

  resizeY.onchange = function(evt) {
    var sideReduction = resizeSide.value || MIN_SIDE_SIZE;
    resizeY.max = previewImage.height - sideReduction;
  };

  resizeSide.onchange = function(evt) {
    resizeSide.max = Math.min(previewImage.width, previewImage.height);
    resizeX.max = Math.max(previewImage.width - resizeSide.value, 0);
    resizeY.max = Math.max(previewImage.height - resizeSide.value, 0);
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
    filterForm.elements['filter-image-src'] = previewImage.src;

    resizeForm.classList.add('invisible');
    filterForm.classList.remove('invisible');
  };

})();
