"""
A class that locates nails in images and separates them out.
"""

import cv2
import tensorflow as tf
import numpy as np
import os

# Load a pre-trained model downloaded from https://github.com/ManWingloeng/nailtracking
# It is used instead of an image rotation model.
RECOGNITION_MODEL_PATH = "models/NailRecognitionModel.pb"
RECOGNITION_MODEL_LABELS = "models/NailRecognitionClasses.pbtxt"
RECOGNITION_MODEL_MIN_CONFIDENCE = 0.6


class NailRecognition:
    model = None  # The model used to focus in on nails in images

    @staticmethod
    def LoadModel():
        """
        Loads the model for nail recognition.
        Updates NailRecognition.model.
        """

        if not NailRecognition.model:  # Only load model if not loaded yet to save time
            print("Loading nail recognition model...")
            NailRecognition.model = tf.Graph()
            with NailRecognition.model.as_default():
                graphDef = tf.compat.v1.GraphDef()

                with tf.io.gfile.GFile(RECOGNITION_MODEL_PATH, "rb") as f:
                    serializedGraph = f.read()
                    graphDef.ParseFromString(serializedGraph)
                    tf.import_graph_def(graphDef, name="")

    @staticmethod
    def GetNailsFromImage(imagePath: str) -> [np.ndarray]:
        """
        Finds each nail in an image and returns them in a list.
        @:param imagePath: The path to an image with nails to parse.
        @:return: A list of nail images for each nail found in the original image.
        """

        if type(imagePath) == str and os.path.isfile(imagePath):  # Actual image
            NailRecognition.LoadModel()
            baseImage = cv2.imread(imagePath, 1)
            # TODO: Break down image into a series of nails
            return []

        return []  # No nails if not valid image path or input

    @staticmethod
    def DoesImageContainNail(nailImages: [np.ndarray]) -> bool:
        """
        Checks if there is at least one nail present in an image.
        :param nailImages: A series of nail images created by GetNailsFromImage
        :return: Whether or not any nails were actually found in the original image.
        """

        if type(nailImages) == list:  # Error handling
            return len(nailImages) >= 1

        return False  # No nails if not valid input
