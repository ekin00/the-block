steps are testi on Windows 11

clone from github
cd theblock\back-api

Create a virtual environment and activate it:

```
python -m venv venv
```

Install the required dependencies:

source venv/bin/activate # On Windows: venv\Scripts\activate

Install the required dependencies: this will take a few minutes

```
pip install -r requirements.txt
```

### Initialize the database

```
python init_db.py

python import_vehicles.py --random-auction
```

### Start the back end with flask in development mode

```
python -m flask --app app run --debug --port 5000
```

cd front-client

npm install

npm run dev
