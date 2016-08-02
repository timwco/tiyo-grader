;(function () {
  
  'use strict';

  function init (items) {
    if (items.path && items.unit) {
      if (window.location.pathname.indexOf(items.path) > -1){
        initialView();
        eventsRun(items);
      }
    } else {
      return alert('Sorry, you need to set your options first in the extension options.');
    }
  }
   
  function fetchGrades (items) {

    preloadView();
    
    const ASSIGNMENT_UNIT = items.unit,
          PATH_ID         = items.path,
          BASE_URL        = 'https://online.theironyard.com',
          PATH_URL        = BASE_URL + '/admin/paths/' + PATH_ID;
    
    // Get the list of students
    $.get(PATH_URL).then( (res) => {
          
      let rows = $(res).find('#unit-' + ASSIGNMENT_UNIT + ' .path-tree-level.assignment');
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
        let active = !$(row).find('.js-toggle-hidden').is(':checked');
        if (active) {
          let assignmentURL = $(row).find('a.text-body').attr('href');
          let promise = $.get(assignmentURL).then( res => {
            let studentRows = $(res).find('#submissions tbody tr');
            let assignmentName = $.trim($(res).find('h4.title strong').text());
            studentRows.each( (index, row) => {
              let studentName = $(row).find('td').eq(0).text();
              let assignmentStatus = $.trim($(row).find('td').eq(1).find('label').text());
              let s = locateStudent(studentName);
              s.assignments.push({ name: assignmentName, status: assignmentStatus, link: assignmentURL });
            });
          });
          promises.push(promise);
        }
      });
      
      Promise.all(promises).then( () => {
        // Filter out students no longer in class
        let outStudents = items.students.split(',');
        students = students.filter( (student) => {
          return outStudents.indexOf(student.name) < 0;
        });
        sortStatuses(students);
      });
       
    });    
  }

  function initialView () {
    let nav = $('.breadcrumb');
    nav.after(`<div id="tw_grades" class="card"><div class="tw_fetch">Show Grade Book</div></div>`);    
  }
  
  function preloadView () {
    $('.tw_fetch').html('Fetching Grades...');
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

    // Sort students from lowest score to highest score
    students.sort(function(a, b) {
      return (a.points > b.points) ? 1 : ((b.points > a.points) ? -1 : 0);
    }); 
        
    let tableHTML = statusesTemplate(students, totalPoints);
    
    $('#tw_grades').html(`<div id="statuses" class="tab-pane" aria-expanded="true">${ tableHTML }</div>`);
  }
  
  
  function statusesTemplate (students, totalPoints) {
    
    let tableBody = '';
    
    
    students.forEach( student => {
      
      let complete = student.statuses['Complete and satisfactory'].length + student.statuses['Exceeds expectations'].length;
      
      let incomplete = student.statuses['Not Submitted'].length + student.statuses['Incomplete'].length + student.statuses['Complete and unsatisfactory'].length;
      
      let grade = Math.floor((student.points / totalPoints) * 100);
      
      // console.log('Student Name: ', student.name);
      // console.log('Student Points: ', student.points);
      // console.log('Total Points: ', totalPoints);
      // console.log('----------------------------------');
      
      let color = function () {
        if (grade > 80) return '#6fbbb7';
        if (grade > 70) return '#f0ad4e';
        if (grade < 70) return '#e74c3c';
      }

      let badList = student.assignments.filter( asgn => {
        return asgn.status === 'Incomplete' || asgn.status === 'Complete And Unsatisfactory' || asgn.status === 'Not Submitted';
      });

      let badListItems = buildBadList(badList);

      
      tableBody += `<tr>`;
      tableBody += `<td><span class="user-profile-name">${ student.name }</span></td>`;
      tableBody += `<td class="tw_holder"><label class="label label-incomplete tw_toggle">${ incomplete }</label>${badListItems}</td>`;
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
              <th>Missing/Incomplete (click to view)</th>
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
  
  function buildBadList (badList) {
    let list = '<ul class="tw_badList">';
    badList.forEach( item => {
      list += `<li><a target="_blank" href="${item.link}">${item.name}</a></li>`;
    });
    list += '</ul>';
    return list;
  }

  function eventsRun (items) {

    $('.col-xs-12').on('click', '.tw_fetch', () => {
      fetchGrades(items);
    });

    $('.col-xs-12').on('click', '.tw_toggle', function () {
      $('.tw_badList').hide();
      $(this).next().toggle();
    });
  }
  
  chrome.storage.sync.get(['path', 'unit', 'students'], function(items) {
    init(items);
  });
  
}());



// Not Graded
// Incomplete
// Complete And Unsatisfactory
// Complete And Satisfactory
// Exceeds Expectations
// Retracted
