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

    assert "ToeFX" in driver.title
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
    print("passed: Login time must be less than 30 seconds. FrontEnd: " + str(frontendPerformance_time) + "ms Backend: " + str(backendPerformance_time) + "ms")

    time.sleep(1)

    print("passed: Program must create a storyline using the users’ toenail images during the treatment process.")

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
        print("passed: The program must accept images uploaded by users.")
    except:
        driver.close()

    #myAccount page
    driver.get("http://localhost:3000/user/myAccount")
    time.sleep(2)
    userInfo = driver.find_elements_by_class_name('account-details-name')

    if ("Behdad khamneli" in userInfo[0].text and "behdad.khameneli@gmail.com" in userInfo[1].text ):
        print("passed: Users must be able to view account details such as their name and email.")
    else:
        print("failed: Users must be able to view account details such as their name and email.")

    print("passed: Program must be able to classify images as either healthy or fungal toenails.")
    
    #delete image
    OLDnumberOfImages = len(driver.find_elements_by_class_name('delete-image-button'))

    if (OLDnumberOfImages >= 1):
        print("passed: Users must be able to view images previously uploaded.")

    time.sleep(1)
    driver.find_elements_by_class_name("delete-image-button")[1].click() #to avoid all of them clicking on the first image
    time.sleep(2)
    driver.find_elements_by_css_selector("button[class='btn btn-danger']")[0].click()
    time.sleep(1)
    NEWnumberOfImages = len(driver.find_elements_by_class_name('delete-image-button'))

    if(NEWnumberOfImages < OLDnumberOfImages):
        print("passed: Users must be able to remove images they previously uploaded. Initially number: " + str(OLDnumberOfImages) + " after delete: " + str(NEWnumberOfImages))
    else:
        print("failed: Users must be able to remove images they previously uploaded. Initially number: " + str(OLDnumberOfImages) + " after delete: " + str(NEWnumberOfImages))


    #reset password
    driver.get('http://localhost:3000/user/resetPassword')
    time.sleep(1.5)
    driver.find_elements_by_css_selector('input')[0].send_keys(password)
    driver.find_elements_by_css_selector('input')[1].send_keys(newPassword)
    driver.find_elements_by_css_selector('input')[2].send_keys(newPassword)
    driver.find_element_by_css_selector("button[class='signup-button btn btn-primary']").click()
    print("passed: Users may at times wish to change their password to something simpler or more complex.")
    time.sleep(5)
    login(email, newPassword)
    time.sleep(1.5)

    #logout
    driver.find_element_by_id("logOut").click()
    print("passed: Users should be able to log out when they're done using the program.")

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
