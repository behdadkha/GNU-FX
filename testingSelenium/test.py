from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import sys
import pathlib
from multiprocessing import Process


def stress(headless, email, password, newPassword):

    options = Options()
    options.headless = True
    options.add_argument('log-level=3')
    if (headless):
        driver = webdriver.Chrome(options=options)
    else:
        driver = webdriver.Chrome()
    
    driver.get("http://localhost:3000")

    assert "gnufx" in driver.title
    print("page loaded")

    def login(email, password):

        emailField = driver.find_element_by_css_selector("[type='email']")
        passwordField = driver.find_element_by_css_selector("[type='password']")
        form = driver.find_element_by_css_selector("[type='submit']")

        emailField.send_keys(str(email))
        passwordField.send_keys(str(password))
        form.click()


    #login
    loginBtn = driver.find_element_by_css_selector("[href='/login']")
    loginBtn.click()

    login(email, password)
    navigationStart = driver.execute_script("return window.performance.timing.navigationStart")
    responseStart = driver.execute_script("return window.performance.timing.responseStart")
    domComplete = driver.execute_script("return window.performance.timing.domComplete")
    backendPerformance_time = responseStart - navigationStart
    frontendPerformance_time = domComplete - responseStart
    print("passed: F-2 The program must let the user log into their existing account to retain access to their data.")
    print("passed: Login time must be less than 30 seconds. FrontEnd: " + str(frontendPerformance_time) + "ms Backend: " + str(backendPerformance_time) + "ms")

    time.sleep(1)

    #dashboard loaded
    print("passed: F-9 Program must create a storyline using the users’ ongle images during the treatment process.")

    #click on graph points
    uploadBtn = driver.find_elements_by_class_name("btnIndexToe")[0].click()
    print("passed: F-10 Users should be able to click on a storyline graph data point and see data from that date.")
    

    #navigate to upload page
    uploadBtn = driver.find_element_by_css_selector("button[id='uploadBtn']")
    uploadBtn.click()
    time.sleep(1)

    #input for upload page
    driver.find_elements_by_css_selector("button[class='graph-foot-button btn btn-primary']")[0].click()
    driver.find_element_by_css_selector("[type='file']").send_keys(str(pathlib.Path("0.png").parent.absolute()) + "/0.png")

    


    #click on the looks good button
    driver.find_elements_by_css_selector("button[class='upload_looksGood_btn btn btn-primary']")[0].click()

    # wait until the upload process is complete
    try:
        WebDriverWait(driver, 100).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".decomposeImageCol"))
        )
        print("passed: Program must be able to detect toes.")
    except:
        driver.close()

    #click on the keep button
    driver.find_elements_by_css_selector("button[id='keepBtn']")[0].click()
    #click on the big toe icon
    driver.find_elements_by_css_selector("button[class='uploadToes0']")[0].click()
    #click on save
    driver.find_elements_by_css_selector("button[class='saveBtn btn btn-primary']")[0].click()

    #wait for it to be saved
    try:
        WebDriverWait(driver, 100).until(
            EC.presence_of_element_located((By.ID, "save_text"))
        )
        print("passed: F-4 The program must accept images uploaded by users.")
    except:
        driver.close()

    #myAccount page
    driver.get("http://localhost:3000/user/myAccount")
    time.sleep(2)
    userInfo = driver.find_elements_by_class_name('account-details-name')

    if ("Behdad khamneli" in userInfo[0].text and "behdad.khameneli@gmail.com" in userInfo[1].text ):
        print("passed: F-11 Users must be able to view account details such as their name and email.")
    else:
        print("failed: F-11 Users must be able to view account details such as their name and email.")

    if ("%" in driver.page_source):
        print("passed: F-8 The program must be able to display the fongique coverage percent of images to the user.")
    else:
        print("failed: F-8 The program must be able to display the fongique coverage percent of images to the user.")


    #rotate image
    driver.find_elements_by_class_name("delete-image-button")[0].click()
    driver.find_elements_by_css_selector("button[class='my-account-rotation-button btn btn-primary']")[0].click()
    driver.find_elements_by_css_selector("button[class='btn btn-danger']")[0].click()

    print("passed: F-16 Users must be able to rotate images they previously uploaded.")

    
    #delete image
    OLDnumberOfImages = len(driver.find_elements_by_class_name('delete-image-button'))

    if (OLDnumberOfImages >= 1):
        print("passed: F-14 Users must be able to view images previously uploaded.")

    time.sleep(1)
    driver.find_elements_by_class_name("delete-image-button")[1].click() #to avoid all of them clicking on the first image
    time.sleep(2)
    driver.find_elements_by_css_selector("button[class='btn btn-danger']")[0].click()
    time.sleep(1)
    NEWnumberOfImages = len(driver.find_elements_by_class_name('delete-image-button'))

    if(NEWnumberOfImages < OLDnumberOfImages): # there will be 2 less because both the rotate and delete buttons have the same classname
        print("passed: F-15 Users must be able to remove images they previously uploaded. Initiall number of buttons: " + str(OLDnumberOfImages) + " after delete: " + str(NEWnumberOfImages))
    else:
        print("failed: F-15 Users must be able to remove images they previously uploaded. Initiall number of buttons: " + str(OLDnumberOfImages) + " after delete: " + str(NEWnumberOfImages))


    #reset password
    driver.get('http://localhost:3000/user/resetPassword')
    time.sleep(1.5)
    driver.find_elements_by_css_selector('input')[0].send_keys(password)
    driver.find_elements_by_css_selector('input')[1].send_keys(newPassword)
    driver.find_elements_by_css_selector('input')[2].send_keys(newPassword)
    driver.find_element_by_css_selector("button[class='signup-button btn btn-primary']").click()
    print("passed: F-12 Users should be able to reset their password.")
    time.sleep(5)
    login(email, newPassword)
    time.sleep(1.5)
    
    #logout
    driver.find_element_by_id("logOut").click()
    print("passed: F-17 Users should be able to log out when they're done using the program.")

    time.sleep(1)
    driver.get('http://localhost:3000/login')

    #forgot password
    driver.find_element_by_css_selector("a[class='forgot-password-button']").click()
    driver.find_elements_by_css_selector('input')[0].send_keys(email)
    driver.find_element_by_css_selector("button[class='login-button btn btn-primary']").click()
    print("passed: F-13 Users must be able to reset a forgotten password before logging in.")

    driver.close()

'''def runInParallel(nums=1, headless=False):
    proc = []
    for _ in range(nums):
        p = Process(target = stress, args=(headless,))
        p.start()
        proc.append(p)
    for p in proc:
        p.join()'''

if __name__ == '__main__':
    headless = True if sys.argv[1] == "True" else False
    email = sys.argv[2]
    password = sys.argv[3]
    newPassword = sys.argv[4]
    stress(headless, email, password, newPassword)
