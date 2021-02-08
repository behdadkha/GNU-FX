import cv2
import numpy as np
from pytest import *

from FungalCoverage import *
from NailExtraction import *
from NailRecognition import *

TEST_IMG_PATH = "images/test/"
RECOGNITION_IMG_PATH = "recognition/"
COVERAGE_IMG_PATH = "coverage/"


class TestNailRecognition:
    def test_LoadModel_Unit(self):
        NailRecognition.LoadModel()
        assert NailRecognition.model

    def test_GetNailsFromImage_Unit_1(self):
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "1.jpg")) == 1

    def test_GetNailsFromImage_Unit_2(self):
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "2.jpg")) == 2

    def test_GetNailsFromImage_Unit_3(self):
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "3.jpg")) == 3

    def test_GetNailsFromImage_Unit_4(self):
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "4.jpg")) == 4

    def test_GetNailsFromImage_Unit_5(self):
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg")) == 5

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

    def test_DoesImageContainNail_Unit_1(self):
        assert NailRecognition.DoesImageContainNail([np.array([])]) is True

    def test_DoesImageContainNail_Unit_2(self):
        assert NailRecognition.DoesImageContainNail([]) is False


class TestNailExtraction:
    def test_TrainModel_Unit(self):
        NailExtraction.TrainModel()
        assert False  # Unclear how this is being handled at this point

    def test_LoadModel_Unit(self):
        NailExtraction.LoadModel()
        assert NailExtraction.model

    def test_GetNailBoundaryPoints_Unit(self):
        # No dataset is available yet rendering this test currently impossible
        assert False

    def test_CreateSegmentedNailImage_Unit(self):
        # No dataset is available yet rendering this test currently impossible
        assert False


class TestFungalCoverage:
    def test_TrainModel_Unit(self):
        FungalCoverage.TrainModel()
        assert False  # Unclear how this is being handled at this point

    def test_LoadModel_Unit(self):
        FungalCoverage.LoadModel()
        assert FungalCoverage.model

    def test_CalculateCoverage_Unit_1(self):
        assert FungalCoverage.CalculateCoverage(TEST_IMG_PATH + COVERAGE_IMG_PATH + "0.jpg") == 0.0

    def test_CalculateCoverage_Unit_2(self):
        assert abs(FungalCoverage.CalculateCoverage(TEST_IMG_PATH + COVERAGE_IMG_PATH + "1.png") - 20.0) < 0.001

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
