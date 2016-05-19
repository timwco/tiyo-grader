
var form      = document.querySelector('#path_form');
var pathField = document.querySelector('.path');

form.addEvent

function init (path) {
  
  if (path) pathField.value = path;
  
  form.addEventListener('submit', updatePath);
  
}

function updatePath (event) {
  event.preventDefault();
  
  let path = pathField.value;
 
  chrome.storage.sync.set({'path': path }, () => {
    alert('Path ID Saved!');
  });
  
}


chrome.storage.sync.get(['path'], function(items) {
  init(items.path);
});