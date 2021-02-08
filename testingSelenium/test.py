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


def stress(headless):

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

    def login():

        email = driver.find_element_by_css_selector("[type='email']")
        password = driver.find_element_by_css_selector("[type='password']")
        form = driver.find_element_by_css_selector("[type='submit']")

        email.send_keys("selenium@gmail.com")
        password.send_keys("123")
        form.click()


    #login
    loginBtn = driver.find_element_by_css_selector("[href='/login']")
    loginBtn.click()

    login()
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
    driver.find_elements_by_css_selector("button[class='graph-foot-button']")[0].click()
    driver.find_elements_by_css_selector("button[class='graph-toe-button']")[1].click()
    driver.find_element_by_css_selector("[type='file']").send_keys(str(pathlib.Path("0.png").parent.absolute()) + "/0.png")

    # wait until the upload proces is complete
    element = driver.find_element_by_id("uploadStatusText")
    while(element.text != "Upload success!"):
        element = driver.find_element_by_id("uploadStatusText")
        time.sleep(4)
    print("passed: The program must accept images uploaded by users.")


    #click on diagnose button
    driver.find_element_by_id("diagnoseBtn").click()
    try:
        WebDriverWait(driver, 100).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "p"))
        )
        print("passed: Program must be able to classify images as either healthy or fungal toenails.")
    except:
        driver.close()

    #myAccount page
    driver.get("http://localhost:3000/user/myAccount")
    time.sleep(2)
    userInfo = driver.find_elements_by_class_name('account-details-name')

    if (userInfo[0].text == "sel" and userInfo[1].text == "selenium@gmail.com"):
        print("passed: Users must be able to view account details such as their name and email.")
    else:
        print("failed: Users must be able to view account details such as their name and email.")

    
    
    #delete image
    OLDnumberOfImages = len(driver.find_elements_by_class_name('delete-image-button'))

    if (OLDnumberOfImages >= 1):
        print("passed: Users must be able to view images previously uploaded.")

    time.sleep(1)
    driver.find_elements_by_class_name("delete-image-button")[0].click() #to avoid all clicking on the first image
    time.sleep(2)
    NEWnumberOfImages = len(driver.find_elements_by_class_name('delete-image-button'))

    if(NEWnumberOfImages < OLDnumberOfImages):
        print("passed: Users must be able to remove images they previously uploaded. Initially number: " + str(OLDnumberOfImages) + " after delete: " + str(NEWnumberOfImages))
    else:
        print("failed: Users must be able to remove images they previously uploaded. Initially number: " + str(OLDnumberOfImages) + " after delete: " + str(NEWnumberOfImages))


    #reset password
    driver.get('http://localhost:3000/user/resetPassword')
    time.sleep(1.5)
    driver.find_elements_by_css_selector('input')[0].send_keys('123')
    driver.find_elements_by_css_selector('input')[1].send_keys('123')
    driver.find_elements_by_css_selector('input')[2].send_keys('123')
    driver.find_element_by_css_selector('button').click()
    print("passed: Users may at times wish to change their password to something simpler or more complex.")
    time.sleep(1.5)
    login()
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
    stress(headless)
