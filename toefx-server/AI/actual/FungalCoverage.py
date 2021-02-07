"""
A class the calculates the fungal infection percentage of a nail.
Meant to be used after NailExtraction.
"""

import cv2
import tensorflow as tf
import numpy as np

from NailExtraction import *


class FungalCoverage:
    model = None

    @staticmethod
    def TrainModel():
        """
        Trains the model used to calculate fungal coverage percent.
        """

        # TODO - Create a model
        pass

    @staticmethod
    def LoadModel():
        """
        Loads the model for calculating fungal coverage percent.
        Updates FungalCoverage.model.
        """

        if not FungalCoverage.model:
            FungalCoverage.model = None  # TODO: Load a created model

    @staticmethod
    def CalculateCoverage(imagePath: str) -> float:
        """
        Calculates the fungal coverage percent in a given image. The image should
        have ideally been created by NailRecognition.GetNailsFromImage.
        :param imagePath: The image of the nail to process. Assumes it's been cropped to the nail.
        :return: The percentage value of the nail's fungal coverage.
        """

        coverage = 0
        image = NailExtraction.CreateSegmentedNailImage(imagePath)  # Extract the nail from the toe
        if image.size != 0:  # A nail was able to extracted
            FungalCoverage.LoadModel()
            # TODO: Actual calculation

        return coverage

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

        return coverageAmount > 0
