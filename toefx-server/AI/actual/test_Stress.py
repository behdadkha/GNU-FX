import cv2
import numpy as np
from pytest import *

from FungalCoverage import *
from NailExtraction import *
from NailRecognition import *

TEST_IMG_PATH = "images/test/"
RECOGNITION_IMG_PATH = "recognition/"
COVERAGE_IMG_PATH = "coverage/"

# Potential future tests: Corrupted images


class TestNailRecognition:
    def test_LoadModel_Stress(self):
        # Test model shouldn't be loaded more than once
        NailRecognition.LoadModel()
        model = NailRecognition.model
        NailRecognition.LoadModel()
        assert model == NailRecognition.model

    def test_GetNailsFromImage_Stress_1(self):
        assert len(NailRecognition.GetNailsFromImage("Not Real Path")) == 0

    def test_GetNailsFromImage_Stress_2(self):
        assert len(NailRecognition.GetNailsFromImage(87541)) == 0

    def test_GetNailsFromImage_Stress_3(self):
        assert len(NailRecognition.GetNailsFromImage([TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg"])) == 0

    def test_DoesImageContainNail_Stress_1(self):
        assert NailRecognition.DoesImageContainNail("Hi") is False

    def test_DoesImageContainNail_Stress_2(self):
        assert NailRecognition.DoesImageContainNail(55156) is False

    def test_DoesImageContainNail_Stress_3(self):
        assert NailRecognition.DoesImageContainNail((np.array([]), np.array([]))) is False


class TestNailExtraction:
    def test_LoadModel_Stress(self):
        # Test model shouldn't be loaded more than once
        NailExtraction.LoadModel()
        model = NailExtraction.model
        NailExtraction.LoadModel()
        assert model == NailExtraction.model

    def test_GetNailBoundaryPoints_Stress_1(self):
        assert NailExtraction.GetNailBoundaryPoints("Hi") == []

    def test_GetNailBoundaryPoints_Stress_2(self):
        assert NailExtraction.GetNailBoundaryPoints(55156) == []

    def test_GetNailBoundaryPoints_Stress_3(self):
        assert NailExtraction.GetNailBoundaryPoints((np.array([]), np.array([]))) == []

    def test_CreateSegmentedNailImage_Stress_1(self):
        assert NailExtraction.CreateSegmentedNailImage("Hi").size == 0

    def test_CreateSegmentedNailImage_Stress_2(self):
        assert NailExtraction.CreateSegmentedNailImage("Not Real Path").size == 0

    def test_CreateSegmentedNailImage_Stress_3(self):
        assert NailExtraction.CreateSegmentedNailImage(55156).size == 0

    def test_CreateSegmentedNailImage_Stress_4(self):
        assert NailExtraction.CreateSegmentedNailImage((np.array([]), np.array([]))).size == 0


class TestFungalCoverage:
    def test_LoadModel_Stress(self):
        # Test model shouldn't be loaded more than once
        FungalCoverage.LoadModel()
        model = FungalCoverage.model
        FungalCoverage.LoadModel()
        assert model == FungalCoverage.model

    def test_CalculateCoverage_Stress_1(self):
        # Test random inputs
        assert FungalCoverage.CalculateCoverage("Blah") == 0

    def test_CalculateCoverage_Stress_2(self):
        assert FungalCoverage.CalculateCoverage(75415) == 0

    def test_CalculateCoverage_Stress_3(self):
        assert FungalCoverage.CalculateCoverage([TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg"]) == 0  # Full hand

    def test_IsNailInfected_Stress_1(self):
        assert FungalCoverage.IsNailInfected(float('inf')) is True

    def test_IsNailInfected_Stress_2(self):
        assert FungalCoverage.IsNailInfected(float('-inf')) is False

    def test_IsNailInfected_Stress_3(self):
        assert FungalCoverage.IsNailInfected("Blah") is False

    def test_IsNailInfected_Stress_4(self):
        assert FungalCoverage.IsNailInfected([5]) is False

    def test_IsNailInfected_Stress_5(self):
        assert FungalCoverage.IsNailInfected(True) is False
