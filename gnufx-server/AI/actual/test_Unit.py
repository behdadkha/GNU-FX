import cv2
import numpy as np
import os
from datetime import datetime
from fastai.vision import *
from pytest import *

from fongiqueCoverage import *
from NailRecognition import *

TEST_IMG_PATH = "AI/actual/test/"
RECOGNITION_IMG_PATH = "recognition/"
COVERAGE_IMG_PATH = "coverage/"
MODELS_PATH = "AI/actual/models/"


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

    def test_GetNailsFromImage_Unit_6(self):
        images, imageBoundaries = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg")
        assert len(images) == len(imageBoundaries)

    def test_GetNailsFromImage_Unit_7(self):
        images, imageBoundaries = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg")
        assert imageBoundaries == [
            (116, 66, 183, 140),
            (175, 89, 239, 163),
            (243, 138, 306, 203),
            (75, 138, 158, 195),
            (214, 114, 276, 182),
        ]

    def test_GetNailsFromImage_Unit_8(self):  # Faulty input
        assert len(NailRecognition.GetNailsFromImage("Not Real Path")[0]) == 0

    def test_GetNailsFromImage_Unit_9(self):  # Faulty input
        assert len(NailRecognition.GetNailsFromImage(87541)[0]) == 0

    def test_GetNailsFromImage_Unit_10(self):  # Faulty input
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

    def test_SaveNailColours_Unit_1(self):
        originalPath = TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg"
        nailImages, imageBoundaries = NailRecognition.GetNailsFromImage(originalPath)
        imageColours = NailRecognition.SaveNailColours(imageBoundaries, originalPath)
        assert len(imageColours) == 5

    def test_SaveNailColours_Unit_2(self):
        originalPath = TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg"
        nailImages, imageBoundaries = NailRecognition.GetNailsFromImage(originalPath)
        NailRecognition.SaveNailColours(imageBoundaries, originalPath)

        testImageWithColours = cv2.imread(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "SaveNailColours_Processed.png")
        newImageWithColours = cv2.imread(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5_CLR.png")
        numEqualElems = np.sum(testImageWithColours == newImageWithColours)  # Make sure both numpy arrays are equal
        assert numEqualElems == testImageWithColours.size

    def test_SaveNailColours_Unit_3(self):  # Faulty input
        assert len(NailRecognition.SaveNailColours("", TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg")) == 0

    def test_SaveNailColours_Unit_4(self):  # Faulty input
        assert len(NailRecognition.SaveNailColours([], "Not Real Path")) == 0

    def test_SaveNailColours_Unit_5(self):  # Faulty input
        assert len(NailRecognition.SaveNailColours([], 5)) == 0


class TestfongiqueCoverage:
    # Takes too long to leave for basic unit tests
    '''
    def test_TrainModel_Unit(self):
        startTime = datetime.now().timestamp()
        fongiqueCoverage.TrainModel()
        modelLastModifiedTime = os.path.getmtime(MODELS_PATH + fongique_COVERAGE_MODEL_NAME + ".pth")
        assert modelLastModifiedTime > startTime  # Training was success if model was updated
    '''

    def test_CreateBaseLearner_Unit(self):
        learn = fongiqueCoverage.CreateBaseLearner()
        assert type(learn) == Learner

    def test_MaskPathFromBaseImagePath_Unit_1(self):
        path = Path("0.png")
        path = fongiqueCoverage.MaskPathFromBaseImagePath(path)
        path.replace("\\", "/")
        assert path.endswith("mask/0.png")

    def test_MaskPathFromBaseImagePath_Unit_2(self):
        path = Path("hi.jpg")
        path = fongiqueCoverage.MaskPathFromBaseImagePath(path)
        path.replace("\\", "/")
        assert path.endswith("mask/hi.png")

    def test_MaskPathFromBaseImagePath_Unit_3(self):
        path = Path(TEST_IMG_PATH + COVERAGE_IMG_PATH + "1.png")
        path = fongiqueCoverage.MaskPathFromBaseImagePath(path)
        path.replace("\\", "/")
        assert path.endswith("mask/1.png")

    def test_MaskPathFromBaseImagePath_Unit_4(self):
        path = 5  # Faulty input
        assert fongiqueCoverage.MaskPathFromBaseImagePath(path) == path  # Still original input

    def test_MaskPathFromBaseImagePath_Unit_5(self):
        path = TEST_IMG_PATH + COVERAGE_IMG_PATH + "1.png"  # Faulty input
        assert fongiqueCoverage.MaskPathFromBaseImagePath(path) == path  # Still original input

    def test_TrainAccuracy_Unit_1(self):
        inputVal = Tensor([[[[[0, 1, 0, 0]]]]])
        target = Tensor([[[[[0, 1, 0, 0]]]]])
        assert fongiqueCoverage.TrainAccuracy(inputVal, target).tolist() == 0

    def test_TrainAccuracy_Unit_2(self):
        assert fongiqueCoverage.TrainAccuracy(5, Tensor()).tolist() == Tensor().tolist()  # Faulty input

    def test_TrainAccuracy_Unit_3(self):
        assert fongiqueCoverage.TrainAccuracy(Tensor(), [5612]).tolist() == Tensor().tolist()  # Faulty input

    def test_TrainAccuracy_Unit_4(self):
        assert fongiqueCoverage.TrainAccuracy("hello", {}).tolist() == Tensor().tolist()  # Faulty input

    def test_LoadModel_Unit(self):
        fongiqueCoverage.LoadModel()
        assert fongiqueCoverage.model is not None

    def test_CalculateCoverage_Unit_1(self):
        assert fongiqueCoverage.CalculateCoverage(TEST_IMG_PATH + COVERAGE_IMG_PATH + "0.jpg") <= 2  # None within 2 percent

    def test_CalculateCoverage_Unit_2(self):
        assert fongiqueCoverage.CalculateCoverage(TEST_IMG_PATH + COVERAGE_IMG_PATH + "1.png") > 1  # Should detect champignon

    def test_CalculateCoverage_Unit_3(self):  # Faulty input
        assert fongiqueCoverage.CalculateCoverage("Blah") == 0.0

    def test_CalculateCoverage_Unit_4(self):  # Faulty input
        assert fongiqueCoverage.CalculateCoverage(75415) == 0.0
