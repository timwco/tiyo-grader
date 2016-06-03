
var form      = document.querySelector('#path_form');
var pathField = document.querySelector('.path');
var unitField = document.querySelector('.unit');

function init (items) {
  
  if (items.path) pathField.value = items.path;
  if (items.unit) unitField.value = items.unit;
  
  form.addEventListener('submit', updateOptions);
  
}

function updateOptions (event) {
  event.preventDefault();
  
  let path = pathField.value;
  let unit = unitField.value;
 
  chrome.storage.sync.set({'path': path, 'unit': unit }, () => {
    alert('Options Saved!');
  });
  
}


chrome.storage.sync.get(['path', 'unit'], function(items) {
  init(items);
});
