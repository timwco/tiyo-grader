## Online Grades

This is a Chome extension that runs on TIYO's Dashboard and will show you the current status of the class.

It will remove anyone who has never completed an assignment (TA's, Observers, etc)

You need to open the *options* page and set your path ID for the extension to work.


#### How this works

Here's how I do grading...

- I categorize each assignment into 2 categories, (`Daily` & `Weekend`)
- Each `Daily` assignment is worth 1 point
- Each `Weekend` assignment is worth 4 points
- To denote a `Weekend` assignment in TIYO I just add `**` to the name.
  - For instance "Create a Todo Form **" might be a title of an assignment.
  - This let's both the student and this plugin know this assignment is a weekend one
- This app will then run on the *Dashboard* page and will add a new tab called *Grades*


#### Calculating The Grades

`(((Completed Weekend * 4) + (Completed Daily * 1)) / ((Total Weekend * 4) + (Total Daily * 1)) * 100)`

This gives me a course completion or "grade". Ideally I personally look for 80% or heigher for graduation.