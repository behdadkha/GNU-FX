import cv2
import numpy as np
import os
from datetime import datetime
from fastai.vision import *
from pytest import *

from FungalCoverage import *
from NailRecognition import *

TEST_IMG_PATH = "AI/actual/test/"
RECOGNITION_IMG_PATH = "recognition/"
COVERAGE_IMG_PATH = "coverage/"
MODELS_PATH = "AI/actual/models/"

# TODO Test cases for NailRecognition.SaveNailColours
# TODO Test cases for NailRecognition.GetNailsFromImage that check the bound output


class TestNailRecognition:
    def test_LoadModel_Unit(self):
        NailRecognition.LoadModel()
        assert NailRecognition.model

    def test_GetNailsFromImage_Unit_1(self):
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "1.jpg")[0]) == 1

    def test_GetNailsFromImage_Unit_2(self):
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "2.jpg")[0]) == 2

    def test_GetNailsFromImage_Unit_3(self):
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "3.jpg")[0]) == 3

    def test_GetNailsFromImage_Unit_4(self):
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "4.jpg")[0]) == 4

    def test_GetNailsFromImage_Unit_5(self):
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg")[0]) == 5

    def test_GetNailsFromImage_Unit_6(self):  # Faulty input
        assert len(NailRecognition.GetNailsFromImage("Not Real Path")[0]) == 0

    def test_GetNailsFromImage_Unit_7(self):  # Faulty input
        assert len(NailRecognition.GetNailsFromImage(87541)[0]) == 0

    def test_GetNailsFromImage_Unit_8(self):  # Faulty input
        assert len(NailRecognition.GetNailsFromImage([TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg"])[0]) == 0

    def test_IsolateHand_Unit_1(self):
        image = cv2.imread(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "FindHand_Base1.png", 1)
        result = NailRecognition.IsolateHand(image.copy())
        processed = cv2.imread(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "FindHand_Processed1.png", 1)
        numEqualElems = np.sum(processed == result)  # Make sure both numpy arrays are equal
        assert numEqualElems == result.size

    def test_IsolateHand_Unit_2(self):
        image = cv2.imread(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "FindHand_Base2.jpg", 1)
        result = NailRecognition.IsolateHand(image.copy())
        processed = cv2.imread(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "FindHand_Processed2.png", 1)
        numEqualElems = np.sum(processed == result)  # Make sure both numpy arrays are equal
        assert numEqualElems == result.size

    def test_IsolateHand_Unit_3(self):
        image = cv2.imread(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "FindHand_Base3.jpg", 1)
        result = NailRecognition.IsolateHand(image.copy())
        processed = cv2.imread(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "FindHand_Processed3.png", 1)
        numEqualElems = np.sum(processed == result)  # Make sure both numpy arrays are equal
        assert numEqualElems == result.size

    def test_IsolateHand_Unit_4(self):
        assert NailRecognition.IsolateHand("Faulty") == "Faulty"  # Faulty input

    @staticmethod
    def setupSaveNailImagesLargeTest():
        testImagePath = TEST_IMG_PATH + RECOGNITION_IMG_PATH + "SaveNailTest.png"

        for i in range(3):  # Remove images from old tests
            if os.path.isfile(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "SaveNailTest_{}.png".format(i)):
                os.remove(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "SaveNailTest_{}.png".format(i))

        testImages = [np.array([[[100, 100, 100]]]), np.array([[[50, 100, 150]]]),
                      np.array([[[50, 100, 150], [20, 30, 40]]])]

        return testImages, testImagePath

    def test_SaveNailImages_Unit_1(self):
        testImagePath = TEST_IMG_PATH + RECOGNITION_IMG_PATH + "SaveNailTest.png"

        if os.path.isfile(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "SaveNailTest_0.png"):
            os.remove(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "SaveNailTest_0.png")  # Remove image from old test

        testImages = [np.array([[[50, 50, 50]]])]
        imagePaths = NailRecognition.SaveNailImages(testImages, testImagePath)
        assert imagePaths == [TEST_IMG_PATH + RECOGNITION_IMG_PATH + "SaveNailTest_0.png"]

    def test_SaveNailImages_Unit_2(self):
        testImages, testImagePath = TestNailRecognition.setupSaveNailImagesLargeTest()
        imagePaths = NailRecognition.SaveNailImages(testImages, testImagePath)
        assert imagePaths == [TEST_IMG_PATH + RECOGNITION_IMG_PATH + "SaveNailTest_0.png",
                              TEST_IMG_PATH + RECOGNITION_IMG_PATH + "SaveNailTest_1.png",
                              TEST_IMG_PATH + RECOGNITION_IMG_PATH + "SaveNailTest_2.png"]

    def test_SaveNailImages_Unit_3(self):
        testImages, testImagePath = TestNailRecognition.setupSaveNailImagesLargeTest()
        imagePaths = NailRecognition.SaveNailImages(testImages, testImagePath)

        newImage0 = cv2.imread(imagePaths[0])
        numEqualElems = np.sum(newImage0 == np.array([[[100, 100, 100]]]))  # Make sure both numpy arrays are equal
        assert numEqualElems == newImage0.size

    def test_SaveNailImages_Unit_4(self):
        testImages, testImagePath = TestNailRecognition.setupSaveNailImagesLargeTest()
        imagePaths = NailRecognition.SaveNailImages(testImages, testImagePath)

        newImage1 = cv2.imread(imagePaths[1])
        numEqualElems = np.sum(newImage1 == np.array([[[50, 100, 150]]]))
        assert numEqualElems == newImage1.size

    def test_SaveNailImages_Unit_5(self):
        testImages, testImagePath = TestNailRecognition.setupSaveNailImagesLargeTest()
        imagePaths = NailRecognition.SaveNailImages(testImages, testImagePath)

        newImage2 = cv2.imread(imagePaths[2])
        numEqualElems = np.sum(newImage2 == np.array([[[50, 100, 150], [20, 30, 40]]]))
        assert numEqualElems == newImage2.size

    def test_SaveNailImages_Unit_6(self):  # Faulty input
        assert len(NailRecognition.SaveNailImages("", TEST_IMG_PATH + RECOGNITION_IMG_PATH + "1.jpg")) == 0

    def test_SaveNailImages_Unit_7(self):  # Faulty input
        assert len(NailRecognition.SaveNailImages([], 5)) == 0

    def test_SaveNailImages_Unit_8(self):  # Faulty input
        assert len(NailRecognition.SaveNailImages([], "Not Real Path")) == 0

    def test_SaveNailImages_Unit_9(self):  # Corrupted input
        assert len(NailRecognition.SaveNailImages(np.array([[[[50, 100, 150, 200]]]]),
                                                  TEST_IMG_PATH + RECOGNITION_IMG_PATH + "1.jpg")) == 0


class TestFungalCoverage:
    # Takes too long to leave for now
    '''
    def test_TrainModel_Unit(self):
        startTime = datetime.now().timestamp()
        FungalCoverage.TrainModel()
        modelLastModifiedTime = os.path.getmtime(MODELS_PATH + FUNGAL_COVERAGE_MODEL_NAME + ".pth")
        assert modelLastModifiedTime > startTime  # Training was success if model was updated
    '''

    def test_CreateBaseLearner_Unit(self):
        learn = FungalCoverage.CreateBaseLearner()
        assert type(learn) == Learner

    def test_MaskPathFromBaseImagePath_Unit_1(self):
        path = Path("0.png")
        path = FungalCoverage.MaskPathFromBaseImagePath(path)
        path.replace("\\", "/")
        assert path.endswith("mask/0.png")

    def test_MaskPathFromBaseImagePath_Unit_2(self):
        path = Path("hi.jpg")
        path = FungalCoverage.MaskPathFromBaseImagePath(path)
        path.replace("\\", "/")
        assert path.endswith("mask/hi.png")

    def test_MaskPathFromBaseImagePath_Unit_3(self):
        path = Path(TEST_IMG_PATH + COVERAGE_IMG_PATH + "1.png")
        path = FungalCoverage.MaskPathFromBaseImagePath(path)
        path.replace("\\", "/")
        assert path.endswith("mask/1.png")

    def test_MaskPathFromBaseImagePath_Unit_4(self):
        path = 5  # Faulty input
        assert FungalCoverage.MaskPathFromBaseImagePath(path) == path  # Still original input

    def test_MaskPathFromBaseImagePath_Unit_5(self):
        path = TEST_IMG_PATH + COVERAGE_IMG_PATH + "1.png"  # Faulty input
        assert FungalCoverage.MaskPathFromBaseImagePath(path) == path  # Still original input

    def test_TrainAccuracy_Unit_1(self):
        inputVal = Tensor([[[[[0, 1, 0, 0]]]]])
        target = Tensor([[[[[0, 1, 0, 0]]]]])
        assert FungalCoverage.TrainAccuracy(inputVal, target).tolist() == 0

    def test_TrainAccuracy_Unit_2(self):
        assert FungalCoverage.TrainAccuracy(5, Tensor()).tolist() == Tensor().tolist()  # Faulty input

    def test_TrainAccuracy_Unit_3(self):
        assert FungalCoverage.TrainAccuracy(Tensor(), [5612]).tolist() == Tensor().tolist()  # Faulty input

    def test_TrainAccuracy_Unit_4(self):
        assert FungalCoverage.TrainAccuracy("hello", {}).tolist() == Tensor().tolist()  # Faulty input

    def test_LoadModel_Unit(self):
        FungalCoverage.LoadModel()
        assert FungalCoverage.model is not None

    def test_CalculateCoverage_Unit_1(self):
        assert FungalCoverage.CalculateCoverage(TEST_IMG_PATH + COVERAGE_IMG_PATH + "0.jpg") <= 1  # Within 1 percent

    def test_CalculateCoverage_Unit_2(self):
        assert abs(FungalCoverage.CalculateCoverage(TEST_IMG_PATH + COVERAGE_IMG_PATH + "1.png") - 38.0) <= 5  # Within 5 percent

    def test_CalculateCoverage_Unit_3(self):  # Faulty input
        assert FungalCoverage.CalculateCoverage("Blah") == 0.0

    def test_CalculateCoverage_Unit_4(self):  # Faulty input
        assert FungalCoverage.CalculateCoverage(75415) == 0.0

    def test_IsNailInfected_Unit_1(self):
        assert FungalCoverage.IsNailInfected(0) is False

    def test_IsNailInfected_Unit_2(self):
        assert FungalCoverage.IsNailInfected(0.0) is False

    def test_IsNailInfected_Unit_3(self):
        assert FungalCoverage.IsNailInfected(1) is True

    def test_IsNailInfected_Unit_4(self):
        assert FungalCoverage.IsNailInfected(1.0) is True

    def test_IsNailInfected_Unit_5(self):
        assert FungalCoverage.IsNailInfected(50) is True

    def test_IsNailInfected_Unit_6(self):
        assert FungalCoverage.IsNailInfected(50.0) is True

    def test_IsNailInfected_Unit_7(self):
        assert FungalCoverage.IsNailInfected(float('inf')) is True

    def test_IsNailInfected_Unit_8(self):  # Faulty input
        assert FungalCoverage.IsNailInfected(float('-inf')) is False

    def test_IsNailInfected_Unit_9(self):  # Faulty input
        assert FungalCoverage.IsNailInfected("Blah") is False

    def test_IsNailInfected_Unit_10(self):  # Faulty input
        assert FungalCoverage.IsNailInfected([5]) is False

    def test_IsNailInfected_Unit_11(self):  # Faulty input
        assert FungalCoverage.IsNailInfected(True) is False
