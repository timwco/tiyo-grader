## Online Grades

This is a Chome extension that runs on TIYO's Dashboard and will show you the current status of the class.

It will remove anyone who has never completed an assignment (TA's, Observers, etc)

You need to open the `options` page and set your Path & Assignments Unit ID for the extension to work. See the [Gettting the ID's](#getting-the-ids) below.

#### Installation

1. Clone this repo
2. Open Chrome Settings (`cmd + ,`)
3. Click `Load unpacked extension...`
4. Navigate to this folder and choose `select`

#### TIYO Setup

In order for this to work properly, you need a bit of setup to happen:

1. You need a unit that contains your assignments only.
2. You need to mark any "Weekend" assignments with the chars `**`
  - I use a simple regex to look for that in the title
  - Example: `Surf & Paddle HTML/CSS Slice Assignment **`

#### Getting the ID's

You'll need two different ID's for this to work. 

- Path ID
  - This is the path ID. Best place to get it is from your URL.
  - The URL _should_ look like : `https://online.theironyard.com/admin/paths/100`
  - Just grab the last numbers (100) and that becomes your Path ID
- Assignments Unit ID
  - As mentioned above, you need to store all of your assignments inside of a specific unit for this to work.
  - To get the ID, just visit your path page (`https://online.theironyard.com/admin/paths/XXX`)
  - On that page, use the Chrome inspector and inspect the unit you want to use. It will look _something_ like the screenshot below.
  - Notice the ID at at end like `data-id="gid://online/Unit/950"`
  - Grab that last id (950) and that becomes your Assignment Path ID

![ScreenShot](http://image.prntscr.com/image/f36e211742d84000bc2d87aaa96d1993.png)


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
