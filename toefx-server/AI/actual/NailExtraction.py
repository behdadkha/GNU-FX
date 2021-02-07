"""
A class that takes an image of a nail and removes the surrounding environment.
Meant to be used after NailRecognition.
"""

import cv2
import tensorflow as tf
import numpy as np
import os


class NailExtraction:
    model = None

    @staticmethod
    def TrainModel():
        """
        Trains the model used to extract nails from their surroundings.
        """

        # TODO - Create a model
        pass

    @staticmethod
    def LoadModel():
        """
        Loads the model for extracting nails.
        Updates NailExtraction.model.
        """

        if not NailExtraction.model:
            NailExtraction.model = None  # TODO: Load a created model

    @staticmethod
    def GetNailBoundaryPoints(image: np.ndarray) -> [float]:
        """
        Gets a set of points that defines the area of the nail in an image.
        :param image: A loaded image of nail.
        :return: A list of points defining the area around the nail in the given image.
        """

        if type(image) != np.ndarray:  # Incorrect input type
            return []  # Return no points

        NailExtraction.LoadModel()
        # TODO: Calculate boundary points
        return []

    @staticmethod
    def CreateSegmentedNailImage(imagePath: str) -> np.ndarray:
        """
        Creates a new image
        :param imagePath: The cropped nail image originally created by GetNailsFromImage.
        :return: An image based on the given image with only the nail visible.
        """

        newImage = np.array([])

        if type(imagePath) == str and os.path.isfile(imagePath):  # Actual image
            image = cv2.imread(imagePath, 1)
            points = NailExtraction.GetNailBoundaryPoints(image)

            if points:  # Points != []
                # TODO: Create extracted nail image
                pass

        return newImage
