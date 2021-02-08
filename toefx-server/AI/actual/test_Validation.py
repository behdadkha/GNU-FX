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
    # Tests Functional Requirement: The program must notify the user if the uploaded image is not a valid image.
    def test_DoesImageContainNail_Acceptance_1(self):
        nailImages = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "1.jpg")
        assert NailRecognition.DoesImageContainNail(nailImages) is True

    def test_DoesImageContainNail_Acceptance_2(self):
        nailImages = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "2.jpg")
        assert NailRecognition.DoesImageContainNail(nailImages) is True

    def test_DoesImageContainNail_Acceptance_3(self):
        nailImages = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "3.jpg")
        assert NailRecognition.DoesImageContainNail(nailImages) is True

    def test_DoesImageContainNail_Acceptance_4(self):
        nailImages = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "4.jpg")
        assert NailRecognition.DoesImageContainNail(nailImages) is True

    def test_DoesImageContainNail_Acceptance_5(self):
        nailImages = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg")
        assert NailRecognition.DoesImageContainNail(nailImages) is True

    def test_DoesImageContainNail_Acceptance_6(self):
        noNail = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "NoNail.jpg")
        assert NailRecognition.DoesImageContainNail(noNail) is False


class TestNailExtraction:
    # Not related to any functional requirement.
    # Simply a stepping stone to help analyze fungal coverage.
    pass


class TestFungalCoverage:
    # Tests Functional Requirement: Program must be able to classify images as either healthy or fungal toenails.
    def test_IsNailInfected_Acceptance_1(self):
        coverage = FungalCoverage.CalculateCoverage(TEST_IMG_PATH + COVERAGE_IMG_PATH + "0.jpg")
        assert FungalCoverage.IsNailInfected(coverage) is False

    def test_IsNailInfected_Acceptance_2(self):
        coverage = FungalCoverage.CalculateCoverage(TEST_IMG_PATH + COVERAGE_IMG_PATH + "1.png")
        assert FungalCoverage.IsNailInfected(coverage) is True
