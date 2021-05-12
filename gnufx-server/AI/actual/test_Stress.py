import cv2
import numpy as np
from pytest import *

from FungalCoverage import *
from NailRecognition import *

TEST_IMG_PATH = "AI/actual/test/"
RECOGNITION_IMG_PATH = "recognition/"
COVERAGE_IMG_PATH = "coverage/"


class TestNailRecognition:
    def test_LoadModel_Stress(self):
        # Test model shouldn't be loaded more than once
        NailRecognition.LoadModel()
        model = NailRecognition.model
        NailRecognition.LoadModel()
        assert model == NailRecognition.model

    def test_GetNailsFromImage_Stress_1(self):
        # Check an image with a bunch of partially revealed hands
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "Stress_1.png")[0]) == 6

    def test_GetNailsFromImage_Stress_2(self):
        # Test corrupted image
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "Stress_2.png")[0]) == 0

    def test_SaveNailColours_Stress(self):
        # Test corrupted image
        assert len(NailRecognition.SaveNailColours([(116, 66, 183, 140)], TEST_IMG_PATH + RECOGNITION_IMG_PATH + "Stress_2.png")) == 0


class TestFungalCoverage:
    def test_LoadModel_Stress(self):
        # Test model shouldn't be loaded more than once
        FungalCoverage.LoadModel()
        model = FungalCoverage.model
        FungalCoverage.LoadModel()
        assert model == FungalCoverage.model

    def test_CalculateCoverage_Stress_1(self):
        # Test full hand
        assert FungalCoverage.CalculateCoverage([TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg"]) == 0

    def test_CalculateCoverage_Stress_2(self):
        # Test corrupted image
        assert FungalCoverage.CalculateCoverage([TEST_IMG_PATH + RECOGNITION_IMG_PATH + "Stress_2.png"]) == 0
