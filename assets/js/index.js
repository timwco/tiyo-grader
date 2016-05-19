;(function () {
  
  'use strict';
   
  function init (pathID) {
    
    if (pathID) {
      preloadView();
    } else {
      return alert('Sorry, you need to set a path first in the extension options.');
    }
    
    let baseURL   = 'https://online.theironyard.com'
    let pathURL   = baseURL + '/admin/paths/' + pathID;
    
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
  
  function preloadView () {
    let nav = $('.nav-tabs');
    nav.append(`<li id="tw_grades" class="nav-item"><a href="#statuses" class="nav-link" data-toggle="tab">Loading Grades...</a></li>`); 
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
          student.points = student.points + 4; // weekend assignment
        } else {
          student.points = student.points + 1;
        }
      });
      student.statuses['Exceeds expectations'].forEach( complete => {
        if (complete.match(/\*\*/)) {
          student.points = student.points + 4; // weekend assignment
        } else {
          student.points = student.points + 1;
        }
      });
    });
    
    // Get Total Value
    let totalPoints = 0;
    students[0].assignments.forEach( assignment => {
      if (assignment.name.match(/\*\*/)) {
        totalPoints = totalPoints + 4; // weekend assignment
      } else {
        totalPoints = totalPoints + 1;
      }
    });
    
    buildView(students, totalPoints);
  }
  
  
  function buildView (students, totalPoints) {
        
    let tableHTML = statusesTemplate(students, totalPoints);
    
    $('#tw_grades a').text('View Grades');
    
    let tabs = $('.tab-content');
    tabs.append(`<div id="statuses" class="tab-pane" aria-expanded="true">${ tableHTML }</div>`);
   
  }
  
  
  function statusesTemplate (students, totalPoints) {
    
    let tableBody = '';
    
    
    students.forEach( student => {
      
      let complete = student.statuses['Complete and satisfactory'].length + student.statuses['Exceeds expectations'].length;
      
      let incomplete = student.statuses['Not Submitted'].length + student.statuses['Incomplete'].length + student.statuses['Complete and unsatisfactory'].length;
      
      let grade = Math.floor((student.points / totalPoints) * 100);
      
      let color = function () {
        if (grade > 80) return '#6fbbb7';
        if (grade > 70) return '#f0ad4e';
        if (grade < 70) return '#e74c3c';
        
      }
      
      tableBody += `<tr>`;
      tableBody += `<td><span class="user-profile-name">${ student.name }</span></td>`;
      tableBody += `<td><label class="label label-incomplete">${ incomplete }</td></label>`;
      tableBody += `<td><label class="label label-complete-and-satisfactory">${ complete }</label></td>`;
      tableBody += `<td colspan="3"><span class="profile-placeholder-medium" style="background-color: ${ color() }">${ grade }</span></td>`;
      tableBody += `<tr>`;
      
    });
    
    return `
      <div class="table-responsive">
        <table class="table table-striped">
          <thead class="thead-default">
            <tr>
              <th>Name</th>
              <th>Missing/Incomplete</th>
              <th>Complete</th>
              <th colspan="3">Grade</th>
            </tr>
          </thead>
          <tbody>
            ${ tableBody }
          </tbody>
        </table>
      </div>    
    `;
  }
  
  
  chrome.storage.sync.get(['path'], function(items) {
    init(items.path);
  });
  
}());



// Not Graded
// Incomplete
// Complete And Unsatisfactory
// Complete And Satisfactory
// Exceeds Expectations
// Retracted