
var form      = document.querySelector('#path_form');
var pathField = document.querySelector('.path');
var unitField = document.querySelector('.unit');
var sField    = document.querySelector('.students');

function init (items) {
  
  if (items.path) pathField.value = items.path;
  if (items.unit) unitField.value = items.unit;
  if (items.students) sField.value = items.students;
  
  form.addEventListener('submit', updateOptions);
  
}

function updateOptions (event) {
  event.preventDefault();
  
  let path = pathField.value;
  let unit = unitField.value;
  let students = sField.value;
 
  chrome.storage.sync.set({'path': path, 'unit': unit, 'students': students }, () => {
    alert('Options Saved!');
  });
  
}


chrome.storage.sync.get(['path', 'unit', 'students'], function(items) {
  init(items);
});
