import cv2
import numpy as np
import os
from pytest import *

from FungalCoverage import *
from NailRecognition import *

TEST_IMG_PATH = "AI/actual/test/"
RECOGNITION_IMG_PATH = "recognition/"
COVERAGE_IMG_PATH = "coverage/"


class TestNailRecognition:
    # Tests Functional Requirement: The program must be able to isolate the nails in a valid image of a foot.
    def test_GetNailsFromImage_Acceptance(self):
        # The image of the foot used to test has four visible nails.
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "6.jpg")[0]) == 4

    # Tests Functional Requirement: The program must be able to isolate the nails in a valid image of a foot.
    @staticmethod
    def setupSaveNailImagesTest():
        originalPath = TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg"

        for i in range(5):  # Remove images from old tests
            if os.path.isfile(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5_{}.png".format(i)):
                os.remove(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5_{}.png".format(i))

        nailImages = NailRecognition.GetNailsFromImage(originalPath)[0]
        imagePaths = NailRecognition.SaveNailImages(nailImages, originalPath)
        return nailImages, imagePaths

    def test_SaveNailImages_Acceptance_1(self):
        nailImages, imagePaths = TestNailRecognition.setupSaveNailImagesTest()

        newImage0 = cv2.imread(imagePaths[0])
        numEqualElems = np.sum(newImage0 == nailImages[0])  # Make sure both numpy arrays are equal
        assert numEqualElems == newImage0.size

    def test_SaveNailImages_Acceptance_2(self):
        nailImages, imagePaths = TestNailRecognition.setupSaveNailImagesTest()

        newImage1 = cv2.imread(imagePaths[1])
        numEqualElems = np.sum(newImage1 == nailImages[1])  # Make sure both numpy arrays are equal
        assert numEqualElems == newImage1.size

    def test_SaveNailImages_Acceptance_3(self):
        nailImages, imagePaths = TestNailRecognition.setupSaveNailImagesTest()

        newImage2 = cv2.imread(imagePaths[2])
        numEqualElems = np.sum(newImage2 == nailImages[2])  # Make sure both numpy arrays are equal
        assert numEqualElems == newImage2.size

    def test_SaveNailImages_Acceptance_4(self):
        nailImages, imagePaths = TestNailRecognition.setupSaveNailImagesTest()

        newImage3 = cv2.imread(imagePaths[3])
        numEqualElems = np.sum(newImage3 == nailImages[3])  # Make sure both numpy arrays are equal
        assert numEqualElems == newImage3.size

    def test_SaveNailImages_Acceptance_5(self):
        nailImages, imagePaths = TestNailRecognition.setupSaveNailImagesTest()

        newImage4 = cv2.imread(imagePaths[4])
        numEqualElems = np.sum(newImage4 == nailImages[4])  # Make sure both numpy arrays are equal
        assert numEqualElems == newImage4.size


class TestFungalCoverage:
    # Tests Functional Requirement: The program must be able to measure toenail fungus growth on uploaded images.
    def test_CalculateCoverage(self):
        # The image in the test is around 33% covered in fungus.
        assert abs(FungalCoverage.CalculateCoverage(TEST_IMG_PATH + COVERAGE_IMG_PATH + "1.png") - 33.0) <= 5  # Within 5 percent
