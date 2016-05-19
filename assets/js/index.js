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
      
      function locateStudent (name) {
        let found = _.find(students, { name: name });
        if (found) return found;
        
        let newS = { name: name, assignments: []};
        students.push(newS);
        return newS;
      }
      
      rows.each( (index, row) => {
        let assignmentURL = $(row).find('a.text-body').attr('href');
        let promise = $.get(assignmentURL).then( res => {
          let rows = $(res).find('#submissions tbody tr');
          let assignmentName = $.trim($(res).find('h4.title strong').text());
          rows.each( (index, row) => {
            let studentName = $(row).find('td').eq(0).text();
            let assignmentStatus = $.trim($(row).find('td').eq(1).find('label').text());
            let s = locateStudent(studentName);
            s.assignments.push({ name: assignmentName, status: assignmentStatus });
          });
        });
        promises.push(promise);
      });
      
      Promise.all(promises).then( () => {
        sortStatuses(students);
      });
       
    });    
  }
  
  
  function sortStatuses (students) {
    
    students.forEach( student => {
      student.statuses = {
       'Not graded': [], 'Incomplete': [], 'Complete and unsatisfactory': [], 
       'Complete and satisfactory': [], 'Exceeds expectations': [], 'Retracted': [], 'Not Submitted': []
      };
      student.assignments.forEach( assignment => {
        student.statuses[assignment.status].push(assignment.name);     
      });
    });
    
    let actualStudents = students.filter( student => student.statuses['Complete and satisfactory'].length > 0);
    
    calculateGrade(actualStudents);
    
  }
  
  function calculateGrade (students) {
            
    students.forEach( student => {
      student.points = 0;
      student.statuses['Complete and satisfactory'].forEach( complete => {
        if (complete.match(/\*\*/)) {
          student.points = student.points + 3; // weekend assignment
        } else {
          student.points = student.points + 1;
        }
      });
    });
    
    // Get Total Value
    let totalPoints = 0;
    students[0].assignments.forEach( assignment => {
      if (assignment.name.match(/\*\*/)) {
        totalPoints = totalPoints + 3; // weekend assignment
      } else {
        totalPoints = totalPoints + 1;
      }
    });
    
    buildView(students, totalPoints);
  }
  
  
  function buildView (students, totalPoints) {
        
    let tableHTML = statusesTemplate(students, totalPoints);
    
    let nav = $('.nav-tabs');
    nav.append(`<li class="nav-item"><a href="#statuses" class="nav-link" data-toggle="tab">Statuses</a></li>`);
    
    let tabs = $('.tab-content');
    tabs.append(`<div id="statuses" class="tab-pane" aria-expanded="true">${ tableHTML }</div>`);
   
  }
  
  
  function statusesTemplate (students, totalPoints) {
    
    let tableBody = '';
    
    
    students.forEach( student => {
      
      let complete = student.statuses['Complete and satisfactory'].length + student.statuses['Exceeds expectations'].length;
      
      let incomplete = student.statuses['Incomplete'].length + student.statuses['Complete and unsatisfactory'].length;
      
      let grade = Math.floor((student.points / totalPoints) * 100);
      
      tableBody += `<tr>`;
      tableBody += `<td><span class="user-profile-name">${ student.name }</span></td>`;
      tableBody += `<td>${ student.statuses['Not graded'].length }</td>`;
      tableBody += `<td>${ student.statuses['Not Submitted'].length }</td>`;
      tableBody += `<td>${ incomplete }</td>`;
      tableBody += `<td>${ complete }</td>`;
      tableBody += `<td>${ grade }</td>`;
      tableBody += `<tr>`;
      
    });
    
    return `
      <div class="table-responsive">
        <table class="table table-striped">
          <thead class="thead-default">
            <tr>
              <th>Name</th>
              <th>Submitted</th>
              <th>Missing</th>
              <th>Incomplete</th>
              <th>Complete</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            ${ tableBody }
          </tbody>
        </table>
      </div>    
    `;
  }
 
  
  init(); // Run the plugin
  
}());



// Not Graded
// Incomplete
// Complete And Unsatisfactory
// Complete And Satisfactory
// Exceeds Expectations
// Retracted