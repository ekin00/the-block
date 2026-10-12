# Submission

Use this as a starting point for your repo's README in your fork of this challenge.

When you're finished, send the link to your repo to your contact at **OPENLANE**.

Delete what you don't need, add what you want.

---

# -The Block `

## How to Run

Step-by-step instructions to get the project running locally.

These steps have been tested on Windows 11.

### Retrieve the code

```
git clone github https://github.com/ekin00/the-block.git

cd the-block\back-api
```

### Create a virtual environment and activate it:

```
python -m venv venv
```

### Install the required dependencies:

```
venv\Scripts\activate
```

Install the required dependencies: this will take a few minutes

```
pip install -r requirements.txt
```

Sample output:

```
Collecting MarkupSafe>=2.0 (from Jinja2>=3.1.2->flask==3.0.3->-r requirements.txt (line 2))
  Using cached markupsafe-3.0.4-cp314-cp314-win_amd64.whl.metadata (2.8 kB)
Collecting typing-extensions>=4.6.0 (from sqlalchemy>=2.0.16->flask-sqlalchemy==3.1.1->-r requirements.txt (line 3))
  Using cached typing_extensions-4.16.0-py3-none-any.whl.metadata (3.3 kB)
Using cached flask-3.0.3-py3-none-any.whl (101 kB)
Using cached flask_sqlalchemy-3.1.1-py3-none-any.whl (25 kB)
Using cached flask_cors-6.0.5-py3-none-any.whl (16 kB)
Using cached python_dotenv-1.0.0-py3-none-any.whl (19 kB)
Using cached blinker-1.9.0-py3-none-any.whl (8.5 kB)
Using cached click-8.5.0-py3-none-any.whl (125 kB)
Using cached itsdangerous-2.2.0-py3-none-any.whl (16 kB)
Using cached jinja2-3.1.6-py3-none-any.whl (134 kB)
Using cached markupsafe-3.0.4-cp314-cp314-win_amd64.whl (14 kB)
Using cached sqlalchemy-2.1.4-cp314-cp314-win_amd64.whl (2.4 MB)
Using cached typing_extensions-4.16.0-py3-none-any.whl (45 kB)
Using cached werkzeug-3.1.9-py3-none-any.whl (228 kB)
Installing collected packages: typing-extensions, python-dotenv, MarkupSafe, itsdangerous, click, blinker, Werkzeug, sqlalchemy, Jinja2, flask, flask-sqlalchemy, flask-cors
Successfully installed Jinja2-3.1.6 MarkupSafe-3.0.4 Werkzeug-3.1.9 blinker-1.9.0 click-8.5.0 flask-3.0.3 flask-cors-6.0.5 flask-sqlalchemy-3.1.1 itsdangerous-2.2.0 python-dotenv-1.0.0 sqlalchemy-2.1.4 typing-extensions-4.16.0

```

### Initialize the database for the first time

The default SQLite URL is `sqlite:///theblock.db`.
database file is `back-api\instance\theblock.db`.
I have check-in.env to make this easier.

```
python init_db.py

python import_vehicles.py --random-auction
```

### Start the back end with flask in development mode

```
python -m flask --app app run --debug --port 5000
```

### Start client

Open another terminal

```

cd front-client

```

execute npm, this will take few seconds

```
npm install

npm run dev
```

At the end you should see something like

```
VITE v6.4.4  ready in 423 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

```

Use http://localhost:5173 as starting point

## to rerun

```
.\venv\Scripts\python.exe reset_db.py
.\venv\Scripts\python.exe import_vehicles.py --random-auction
```

## Time Spent

Roughly how much time you spent and how you approached the time box.
~10 hr
Wed-Thursday looking at car auction website, test ux
Friday api
Sat-Sun client

## Assumptions and Scope

### What you intentionally included, skipped, or simplified.

I was deeply impressed by how effectively AI handled the search and filter functionality, which allowed me to focus entirely on the table's user experience and components/inventory/VehicleGrid.jsx was reused in Favorites. The data fits perfectly into a table layout. Users can click a row to either favorite an item or view its details, and double-clicking a vehicle cell opens the details view instantly. In the vehicles detail page, I added tooltip in "VIN . Grade . Title status" to jump down to Condition report.

While I initially start with feature toggles for favorites and compared in mind, but I ultimately shifted my focus toward polishing the overall UX.

I had to skip the comparison feature, it's disable on the left most column. But the favorites page serves a similar purpose, even if it doesn't allow for a side-by-side comparison."

## Stack

- **Frontend:**
  - vite, vitest
  - react 19
  - emotion/react
  - mui 7 + x-data-grid

- **Backend:**
  - Python
  - SQLAlchemy
  - Flask

- **Database:**
  - SQLite

## What I Built

### A brief description of your project and your approach.

It felt like participating in a hackathon, something I haven’t done in a while.

A car auction webite with lots of data, not too much flashing photos. I start by explored several car auction websites and drew on my previous experience with eBay, but quickly realized that the key information is quite different. Year, Make, Model, and Trim (YMMT) are essential to the experience. While some sites emphasize photos and videos, this challenge is primarily about the data.

To get a better sense of what was possible, I downloaded sample code from MUI and used it as a starting point. I then built a mockup with hardcoded data to experiment with the interface and functionality. You can check it out prototype http://localhost:5173/demo it's done with from from AI.

AI helped me turn the code challenge into a phased development plan, with clear tasks, acceptance criteria, and testing steps for each phase. At every stage, both AI and I reviewed the implementation, verified the behavior, and addressed issues before moving on.

I found the grill-me, react-best-practices, and material-ui-review skills especially useful. They helped AI and me to challenge assumptions, review the React architecture, catch potential issues, and validate the MUI implementation.

The result was a working React/MUI prototype with hardcoded vehicle data, interactive Favorite and Compare features, and a foundation for exploring the car auction experience. More importantly, I had a structured process for moving from an initial idea to a functional demo, with AI assisting in both development and verification rather than simply generating code.

## Notable Decisions

### What choices did you make and why? What tradeoffs did you consider?

I happen to be working on sample code from github planventure, this setup most of the stack.  
I have considered tanstack but x-data-grid; community supported edition is what all I need.
I use Github Copilot because I am using at work and there are different LLM that I can try and play with.

## Testing

## What you tested and how.

Test at every phases using vitest, playwright mcp and shared browser.  
The backend has it's own test ./back-api/verify/ there is AGENTS.md to guide the AI.

## What I'd Do With More Time

Finish the Compared page.
