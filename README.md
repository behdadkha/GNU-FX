# gnufx 
A web application that helps people detect fongique infection, and allows them to keep track of their treatment progress.

## Requirements 
### Core Requirements
* [Nodejs (15.5.1)](https://nodejs.org/en/)
* [Python3 (3.7.4)](https://www.python.org/downloads/)

### Additional Requirements
If you are using the recommended Docker file to run the web app (see below), you do not need to install these requirements. Otherwise, these requirements can be installed by running ``pip install -r requirements.txt`` in the root. 

**Note**: Make sure you have *python3* alias set as *python*. Running `python` should open an interactive terminal.

## Running the Application using Docker (Recommended):
**Make sure you have [docker](https://www.docker.com/) installed on your computer.**

### Option 1: Using Docker-Compose (Easiest)
1. Open up a terminal.
2. Navigate to the root directory (where the *docker-compose.yml* file is).
3. Run docker compose.<br>`docker-compose up`
4. Open up a web browser and go to `http://localhost:3000/`.

### Option 2
1. Open up a terminal.
2. Navigate to the *gnufx-client* directory.
3. Install all the required dependencies:<br>
`npm install` 
4. Start the front-end server.<br>
`npm start`
5. Open a new terminal. From the root directory (gnufx), navigate to the *gnufx-server* folder. Run<br>
`docker build -t gnufxserver .` (notice the `.` at the end!)<br>
Then run<br>
`docker run -it -v $(pwd)/images:/gnufx-server/images -p 3001:3001 gnufxserver` <br>
**Note**: if you are using powershell put the volume mount in "" like<br>
`"$(pwd)/images:/gnufx-server/images"`
6. Open up a web browser and go to http://localhost:3000/.

## Running the Application without Docker:
**Make sure you have all the requirements installed to be able to run the AI without any errors.**
**If you are using `pip`, make sure to install [Pytorch](https://pytorch.org/get-started/locally/) along with FastAI (this will be done automatically if installing from the *py_requirements.txt* file).** \
**Note: Make sure running `python` in your terminal opens up an interactive interface. (ie. you can run a python program using "python example.py")** 
1. Open up a terminal.
2. Navigate to the `gnufx-client` directory.
3. Install all the required dependencies:<br>
`npm install` 
4. Start the front-end server.<br>
`npm start`
5. From the root directory (gnufx), navigate to the *gnufx-server* folder.  
6. Install all the required dependencies.<br>
`npm install`
7. Start the back-end server.<br>
`npm start`
8. Open up a web browser and go to http://localhost:3000/

**If you ran into any errors after uploading an image, try using these commands to install the requirements
(for linux):**<br>
`apt-get install -y python3-dev python3-pip` <br>
`pip3 install pillow `<br>
`apt-get install -y curl `<br>
`apt-get install sudo \`<br>
`pip3 install torch==1.3.1 torchvision==0.4.2`<br> 
`pip3 install opencv-contrib-python-headless `<br>
`pip3 install fastai==1.0.59`<br>

## Usage
1. Click on the signup button to create a new account.
2. Use the same email address and password to login.
3. Now, from the dashboard, click on the "Upload Image" button to upload an image of your foot (make sure your ongles are in the image).
4. Wait for the AI to finish analyzing the image and finding your toes.
5. Click on `save` or `discard` to save or discard any image.
6. After successfully uploading images and selecting toes, go back to the dashboard to access your results.
7. Click on the left or right foot button to change the selected foot.
8. You can change the toes by clicking on the circles above the foot image bellow the graph.
9. Clicking on the graph points shows more details on the right side of the graph.
10. You may use the my-account button on the side-bar to delete your images or reset your password.
11. Finally, use the "Log Out" button to log out.

## Issues can be reported to us on GitHub
To report an issue go to `https://github.com/Behdadkha/gnufx`
Click on issues and create a new issue.

# Tests (unit-test, validation-test, stress and security test)
**Screenshots are at the bottom.**
* Used **Jest** to test the react app and the node app.
* Created a **bot** for validation and stress test (Some part of the validation test is done using Jest but because of security reasons, react/jest does not allow image upload).
*  Used **Burp suite professional** for security and stress tests.
* Used **pytest --cov** for machine learning tests.

Tests for the React app are in the `gnufx-client` -> `src` -> `tests` folder.
Tests for the Node app are in the `gnufx-server` -> `tests` folder.
Tests for the AI are in `gnufx-server` -> `AI` -> `actual` folder.
Bot tester is in `./testingSelenium`.

## Test reports
* To access the test report generated for the React app, from the root directory, go to `gnufx-client` -> `coverage` -> `icov-report` -> `index.html`. 
* To access the test report generated for the Node app, from the root directory, go to `gnufx-server` -> `coverage` -> `icov-report` -> `index.html`.
* To access the test report generated by Burp suite, from the root directory, go to `BurpSuite` -> `burp.html` and there is a screen-shot(burp.JPG) showing the number of requests sent.
* To access the test report generated by Pytest, from the root directory, go to `gnufx-server` -> `coverage` -> `Pytest-report`.
* to access the test results generated by the Bot, go to `./testingSelenium` -> `SampleRun.PNG`.

## Running the Tests
### Setup
* Make sure you meet the requirements listed above.
* Make sure you have Python Selenium installed.(pip install selenium)
* Go to `gnufx-client` and run `npm install`
* Go to `gnufx-server` and run `npm install`

### Run
* To run the **unit tests** for the React app, go to `gnufx-client` and run `npm run unitTest`.  The output is  a table showing the percentage of statements coverage, branch coverage, function coverage and line coverage.
* To run the **unit-tests** for the node app, go to `gnufx-server` and run `npm run unitTest`. The output is  a table showing the percentage of statements coverage, branch coverage, function coverage and line coverage.
* To run the **unit-tests** for the machine learning, go to `gnufx-server` and run `pytest --cov`. The output is  a table showing the percentage of statement coverage, as well as tests passed or failed.
* To run the **validation tests** (most of it done by the Bot (see `Instructions for Running the Bot`)), first go to `gnufx-server` and run `npm start`. Then go to `gnufx-client` and run `npm run validationTest`.

## Instructions for Running the Bot (Continue Validation and Stress Test)
1. Run both frontend and backend: Go to `gnufx-client` and run `npm start`, then go to `gnufx-server` and run `npm start`.
2. Get the required chromedriver for your OS and put it in `TestingSelenium`. `https://sites.google.com/a/chromium.org/chromedriver/downloads`<br/>
Note: chromedriver.exe is already in the folder `TestingSelenium`. 
3. Go to `TestingSelenium`, run `python ./test.py False` to see the action, or run `python ./test.py False` to run it in headless mode.

#### Images
  <img src="./gnufx-client/coverage/frontendtests.JPG" alt="screenshot of server" width="70%"/>
  <img src="./gnufx-server/coverage/servertest.JPG" alt="screenshot of front end tests" width="70%"/>
  <img src="./gnufx-server/coverage/aitest.png" alt="screenshot of the AI test" width="70%"/>
  <img src="./testingSelenium/SampleRun.PNG" alt="screenshot of the bot" width="70%"/>
  <img src="./BurpSuite/burp.JPG" alt="screenshot of the burp" width="70%"/>
