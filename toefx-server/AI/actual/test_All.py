from pytest import *
from FungalCoverage import *
from NailExtraction import *
from NailRecognition import *

TEST_IMG_PATH = "images/test/"
RECOGNITION_IMG_PATH = "recognition/"
COVERAGE_IMG_PATH = "coverage/"

# Potential future tests: Corrupted images


class TestNailRecognition:
    def test_LoadModel_Unit(self):
        NailRecognition.LoadModel()
        assert NailRecognition.model

    def test_LoadModel_Stress(self):
        # Test model shouldn't be loaded more than once
        model = NailRecognition.model
        NailRecognition.LoadModel()
        assert model == NailRecognition.model

    def test_GetNailsFromImage_Unit(self):
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "1.jpg")) == 1
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "2.jpg")) == 2
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "3.jpg")) == 3
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "4.jpg")) == 4
        assert len(NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg")) == 5

    def test_GetNailsFromImage_Stress(self):
        assert len(NailRecognition.GetNailsFromImage("Not Real Path")) == 0
        assert len(NailRecognition.GetNailsFromImage(87541)) == 0
        assert len(NailRecognition.GetNailsFromImage([TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg"])) == 0

    def test_DoesImageContainNail_Unit(self):
        nailImages = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "1.jpg")
        assert NailRecognition.DoesImageContainNail(nailImages) is True

        nailImages = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "2.jpg")
        assert NailRecognition.DoesImageContainNail(nailImages) is True

        nailImages = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "3.jpg")
        assert NailRecognition.DoesImageContainNail(nailImages) is True

        nailImages = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "4.jpg")
        assert NailRecognition.DoesImageContainNail(nailImages) is True

        nailImages = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg")
        assert NailRecognition.DoesImageContainNail(nailImages) is True

        noNail = NailRecognition.GetNailsFromImage(TEST_IMG_PATH + RECOGNITION_IMG_PATH + "NoNail.jpg")
        assert NailRecognition.DoesImageContainNail(noNail) is False

    def test_DoesImageContainNail_Stress(self):
        assert NailRecognition.DoesImageContainNail("Hi") is False
        assert NailRecognition.DoesImageContainNail(55156) is False
        assert NailRecognition.DoesImageContainNail((np.array([]), np.array([]))) is False


class TestNailExtraction:
    def test_TrainModel_Unit(self):
        NailExtraction.TrainModel()
        assert False  # Unclear how this is being handled at this point

    def test_LoadModel_Unit(self):
        NailExtraction.LoadModel()
        assert NailExtraction.model

    def test_LoadModel_Stress(self):
        # Test model shouldn't be loaded more than once
        model = NailExtraction.model
        NailExtraction.LoadModel()
        assert model == NailExtraction.model

    def test_GetNailBoundaryPoints_Unit(self):
        # No dataset is available yet rendering this test currently impossible
        assert False

    def test_GetNailBoundaryPoints_Stress(self):
        assert NailExtraction.GetNailBoundaryPoints("Hi") == []
        assert NailExtraction.GetNailBoundaryPoints(55156) == []
        assert NailExtraction.GetNailBoundaryPoints((np.array([]), np.array([]))) == []

    def test_CreateSegmentedNailImage_Unit(self):
        # No dataset is available yet rendering this test currently impossible
        assert False

    def test_CreateSegmentedNailImage_Stress(self):
        assert NailExtraction.CreateSegmentedNailImage("Hi").size == 0
        assert NailExtraction.CreateSegmentedNailImage("Not Real Path").size == 0
        assert NailExtraction.CreateSegmentedNailImage(55156).size == 0
        assert NailExtraction.CreateSegmentedNailImage((np.array([]), np.array([]))).size == 0


class TestFungalCoverage:
    def test_TrainModel_Unit(self):
        FungalCoverage.TrainModel()
        assert False  # Unclear how this is being handled at this point

    def test_LoadModel_Unit(self):
        FungalCoverage.LoadModel()
        assert FungalCoverage.model

    def test_LoadModel_Stress(self):
        # Test model shouldn't be loaded more than once
        model = FungalCoverage.model
        FungalCoverage.LoadModel()
        assert model == FungalCoverage.model

    def test_CalculateCoverage_Unit(self):
        assert FungalCoverage.CalculateCoverage(TEST_IMG_PATH + COVERAGE_IMG_PATH + "0.jpg") == 0.0
        assert abs(FungalCoverage.CalculateCoverage(TEST_IMG_PATH + COVERAGE_IMG_PATH + "1.png") - 20.0) < 0.001

    def test_CalculateCoverage_Stress(self):
        # Test random inputs
        assert FungalCoverage.CalculateCoverage("Blah") == 0
        assert FungalCoverage.CalculateCoverage(75415) == 0
        assert FungalCoverage.CalculateCoverage([TEST_IMG_PATH + RECOGNITION_IMG_PATH + "5.jpg"]) == 0

    def test_IsNailInfected_Unit(self):
        assert FungalCoverage.IsNailInfected(0) is False
        assert FungalCoverage.IsNailInfected(0.0) is False
        assert FungalCoverage.IsNailInfected(1) is True
        assert FungalCoverage.IsNailInfected(1.0) is True
        assert FungalCoverage.IsNailInfected(50) is True
        assert FungalCoverage.IsNailInfected(50.0) is True

    def test_IsNailInfected_Acceptance(self):
        coverage = FungalCoverage.CalculateCoverage(TEST_IMG_PATH + COVERAGE_IMG_PATH + "0.jpg")
        assert FungalCoverage.IsNailInfected(coverage) is False

        coverage = FungalCoverage.CalculateCoverage(TEST_IMG_PATH + COVERAGE_IMG_PATH + "1.png")
        assert FungalCoverage.IsNailInfected(coverage) is True

    def test_IsNailInfected_Stress(self):
        assert FungalCoverage.IsNailInfected(float('inf')) is True
        assert FungalCoverage.IsNailInfected(float('-inf')) is False
        assert FungalCoverage.IsNailInfected("Blah") is False
        assert FungalCoverage.IsNailInfected([5]) is False
        assert FungalCoverage.IsNailInfected(True) is False


