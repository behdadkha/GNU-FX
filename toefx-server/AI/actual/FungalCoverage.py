"""
A class the calculates the fungal infection percentage of a nail.
Meant to be used after NailRecognition.
"""

import cv2
import numpy as np
import os
from fastai.vision import *
from fastai.callbacks.hooks import *

VALIDATION_DATA_PERCENT = 0.15  # 15% of training set is used for validation
BATCH_SIZE = 8  # How many images are used per batch of training
FUNGAL_COVERAGE_MODEL_NAME = "FungalCoverageModel"
IMAGE_CLASSES = np.array(["None", "Nail", "Fungus"])  # Classifications for pixels in images
CLASS_VALUES = {value: key for key, value in enumerate(IMAGE_CLASSES)}  # Numerical Ids for each class in IMAGE_CLASSES

CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))  # Quick access to the location of this file
MASK_PATH = CURRENT_DIR + "/train/mask"
BASE_IMAGE_PATH = CURRENT_DIR + "/train/raw"


class FungalCoverage:
    model = None

    @staticmethod
    def TrainModel():
        """
        Trains the model used to calculate fungal coverage percent.
        For the why, see: https://towardsdatascience.com/image-segmentation-with-fastai-9f8883cc5b53
        """

        learn = FungalCoverage.CreateBaseLearner()
        lr_find(learn)
        learn.fit_one_cycle(10, slice(1e-06, 1e-03), pct_start=0.9)
        learn.unfreeze()
        lr_find(learn)
        learn.fit_one_cycle(12, slice(1e-5, 1e-4), pct_start=0.8)
        learn.save(FUNGAL_COVERAGE_MODEL_NAME)  # Save the model to models/FUNGAL_COVERAGE_MODEL_NAME for later

    @staticmethod
    def CreateBaseLearner() -> Learner:
        """
        Creates the learner used to train or load the model.
        For the why, see: https://towardsdatascience.com/image-segmentation-with-fastai-9f8883cc5b53
        :return: The learner for training a new model or loading an old model.
        """

        size = 128  # Base image size
        src = (SegmentationItemList.from_folder(BASE_IMAGE_PATH)
               .split_by_rand_pct(VALIDATION_DATA_PERCENT)
               .label_from_func(FungalCoverage.MaskPathFromBaseImagePath, classes=IMAGE_CLASSES))
        trainData = (src.transform(get_transforms(), size=size, tfm_y=True)
                     .databunch(bs=BATCH_SIZE, num_workers=0)
                     .normalize(imagenet_stats))
        learn = unet_learner(trainData, models.resnet34, path=CURRENT_DIR,
                             metrics=FungalCoverage.TrainAccuracy, wd=1e-2)
        return learn

    @staticmethod
    def MaskPathFromBaseImagePath(baseImagePath: pathlib) -> str:
        """
        Takes a path to a base image and finds the corresponding mask image needed to train the model.
        :param baseImagePath: An sub-object of base type PathLib that contains the path to the image path.
                              It is of type pathlib.WindowsPath on Windows machines.
        :return: The path to the corresponding mask image.
        """

        try:
            # Masks have the same name and are always pngs (for lossless image quality)
            return MASK_PATH + "/" + f'{baseImagePath.stem}.png'
        except AttributeError:  # baseImagePath wasn't actually a pathlib path
            return baseImagePath  # Let whoever called this function deal with the error

    @staticmethod
    def TrainAccuracy(inputVals: Tensor, target: Tensor) -> Tensor:
        """
        Calculates the accuracy of an epoch of training.
        For the how, see: https://towardsdatascience.com/image-segmentation-with-fastai-9f8883cc5b53
        :param inputVals: A tensor containing the pixels in the original image.
        :param target: A tensor containing the pixels in the estimated mask.
        :return: The accuracy that the input matches the proposed target.
        """

        if type(inputVals) != Tensor or type(target) != Tensor:  # Error handling
            return Tensor()

        target = target.squeeze(1)  # Flattens down the tensor into averages
        mask = target != CLASS_VALUES["None"]  # This is a new tensor which is a list of bools of image spots that
                                               # contains relevant data such as a nail or fungus.
        return (inputVals.argmax(dim=1)[mask] == target[mask]).float().mean()  # See the provided explanation link

    @staticmethod
    def LoadModel():
        """
        Loads the model for calculating fungal coverage percent.
        Updates FungalCoverage.model.
        """

        if (not FungalCoverage.model  # Model hasn't already been loaded in
                and os.path.isfile(CURRENT_DIR + "/models/{}.pth".format(FUNGAL_COVERAGE_MODEL_NAME))):
            FungalCoverage.model = FungalCoverage.CreateBaseLearner()  # A base learner is needed to load the model
            FungalCoverage.model.load(FUNGAL_COVERAGE_MODEL_NAME)  # Load in pre-trained model

    @staticmethod
    def CalculateCoverage(imagePath: str) -> float:
        """
        Calculates the fungal coverage percent in a given image. The image should
        have ideally been created by NailRecognition.GetNailsFromImage.
        :param imagePath: The image of the nail to process. Assumes it's been cropped to the nail.
        :return: The percentage value of the nail's fungal coverage.
        """

        coverage = 0.0
        if type(imagePath) == str and os.path.isfile(imagePath):  # Actual image
            FungalCoverage.LoadModel()
            if FungalCoverage.model is None:  # Model doesn't exist on server
                return coverage

            # Open the image
            # For the why, see the comments on https://forums.fast.ai/t/prediction-on-video-input-file/41029/4
            image = cv2.imread(imagePath)
            t = torch.tensor(np.ascontiguousarray(np.flip(image, 2)).transpose(2, 0, 1)).float() / 255
            image = Image(t)  # fastai.vision.Image, not PIL.Image

            # Process the image
            predictions = FungalCoverage.model.predict(image)

            # Process the prediction
            flatList = predictions[1].flatten(0).tolist()
            percentNail = flatList.count(CLASS_VALUES["Nail"]) / len(flatList)  # Percent of image that's a nail
            percentFungus = flatList.count(CLASS_VALUES["Fungus"]) / len(flatList)  # Percent of image that's infected
            percentNail += percentFungus  # The fungal area is part of the nail too
            coverage = round((percentFungus / percentNail) * 100, 2)  # Turn into actual percentage - 2 decimal points

        return round(coverage, 1)  # Round to single decimal place

    @staticmethod
    def IsNailInfected(coverageAmount: float) -> bool:
        """
        Determines if a nail is infected based on a given coverage value.
        :param coverageAmount: The coverage of the nail calculated by FungalCoverage.CalculateCoverage
        :return: Whether or not the nail is infected based on the given value.
        """

        if type(coverageAmount) == int:
            coverageAmount = float(coverageAmount)  # Convert to float if necessary
        elif type(coverageAmount) != float:
            return False  # Always return False if bad input

        return coverageAmount >= 1  # 1 % error rate
