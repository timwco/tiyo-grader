;(function () {
  
  'use strict';
  
  let baseURL   = 'https://online.theironyard.com'
  let groupURL  = baseURL + '/admin/groups/2';
  let userURL   = baseURL + '/admin/users/';
  
   
  function init () {
    // Get the list of students
    $.get(groupURL).then( (res) => {
          
      let students  = [];
      let rows = $(res).find('#students tbody tr');
      
      rows.each( (index, row) => {
        let url = $(row).find('td').eq(0).find('a').attr('href');
        students.push({
          name: $(row).find('td').eq(0).find('.user-profile-name').text(),
          id: url.substr(url.lastIndexOf('/') + 1)
        });
      });
      
      getStudentsData(students);
      
    });    
  }
  
  function getStudentsData (students) {
    
    let promises = [];

    students.forEach( (student, i) => {
      
      students[i].assignments = [];  
      
      let promise = $.get(userURL + student.id).then( res => {
        
        let rows = $(res).find('#assignments tbody tr');
        rows.each( (index, row) => {
          students[i].assignments.push({
            name: $.trim($(row).find('td').eq(0).find('a').text()),
            status: $.trim($(row).find('td').eq(2).find('label').text())
          });
        });
      });
      
      promises.push(promise);
     
    });
    
    Promise.all(promises).then( () => sortAssignments(students) );
  }
  
  
  function sortAssignments (students) {
    
    let actualStudents = students.filter( student => student.assignments.length > 0);
    
    actualStudents.forEach( (student, i) => {
      
    });
    
  }

  
  init(); // Run the plugin
  
}());