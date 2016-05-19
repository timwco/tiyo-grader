;(function () {
  
  'use strict';
  
  let baseURL   = 'https://online.theironyard.com'
  let pathURL   = baseURL + '/admin/paths/100';
  let userURL   = baseURL + '/admin/users/';
  
   
  function init () {
    // Get the list of students
    $.get(pathURL).then( (res) => {
          
      let rows = $(res).find('.path-tree-level.assignment');
      let promises = [];
      let students = [];
      
      function createStudents (rows) {
        rows.each( row => {
          students.push({ name: $.trim($(row).find('td').eq(0).text()), assignments: [] });
        });
      }
      
      rows.each( row => {
        let assignmentURL = $(row).find('a.text-body').attr('href');
        let promise = $.get(assignmentURL).then( res => {
          let rows = $(res).find('#submissions tbody tr');
          let assignmentName = $.trim($(res).find('h4.title strong').text());
          
          createStudents(rows); // First let's add students
          console.log(students);
          
          // rows.each( row => {
          //   let studentName = $.trim($(row).find('td').eq(0).text());
          //   let assignmentStatus = $.trim($(row).find('td').eq(1).find('label').text());
            
          //   let student = getOrCreateStudent(studentName);
            
          //   console.log(student);
            
            
          // });
        });
        promises.push(promise);
      });
      
      Promise.all(promises).then( () => {
        console.log(students);
      });
      
      
    });    
  }
 
  
  init(); // Run the plugin
  
}());



// Not Graded
// Incomplete
// Complete And Unsatisfactory
// Complete And Satisfactory
// Exceeds Expectations
// Retracted