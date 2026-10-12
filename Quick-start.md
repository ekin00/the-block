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

#### Troubleshooting

netstat -ano | findstr :5000

taskkill /pid process_id /F
