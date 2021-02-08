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

            with NailRecognition.model.as_default():
                with tf.compat.v1.Session(graph=NailRecognition.model) as session:
                    imageTensor = NailRecognition.model.get_tensor_by_name("image_tensor:0")
                    boxesTensor = NailRecognition.model.get_tensor_by_name("detection_boxes:0")

                    # Get the score and class label for each potential nail in the image
                    scoresTensor = NailRecognition.model.get_tensor_by_name("detection_scores:0")
                    classesTensor = NailRecognition.model.get_tensor_by_name("detection_classes:0")
                    numDetections = NailRecognition.model.get_tensor_by_name("num_detections:0")

                    # Load the image
                    image = cv2.imread(imagePath, 1)
                    baseImage = image.copy()
                    (height, width) = image.shape[:2]
                    output = []  # A list of nail images

                    # Process the image
                    image = NailRecognition.IsolateHand(image.copy())
                    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Alter the colour palette to help with the prediction
                    image = np.expand_dims(image, axis=0)

                    # Find the nails in the image
                    (boundaries, scores, labels, N) = session.run([boxesTensor, scoresTensor,
                                                                   classesTensor, numDetections],
                                                                  feed_dict={imageTensor: image})
                    boundaries = np.squeeze(boundaries)
                    scores = np.squeeze(scores)

                    # Crop out each nail in the image
                    for (boundary, score) in zip(boundaries, scores):
                        if score < RECOGNITION_MODEL_MIN_CONFIDENCE:
                            continue

                        # Scale the bounding box from the range [0, 1] to [W, H]
                        (startY, startX, endY, endX) = boundary
                        startX = int(startX * width)
                        startY = int(startY * height)
                        endX = int(endX * width)
                        endY = int(endY * height)

                        output.append(baseImage[startY:endY, startX:endX])  # Crop to the nail

                    return output

        return []  # No nails if not valid image path or input

    @staticmethod
    def IsolateHand(image):
        """
        Applies skin colour binarization to the image. Anything that isn't skin colour is blotted out.
        :param image: The image to process.
        :return: A new image with the binarization applied.
        """

        YCrCb_frame = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
        YCrCb_frame = cv2.GaussianBlur(YCrCb_frame, (3, 3), 0)
        binMask = cv2.inRange(YCrCb_frame, np.array([0, 127, 75]), np.array([255, 177, 130]))

        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        binMask = cv2.dilate(binMask, kernel, iterations=5)
        result = cv2.bitwise_and(image, image, mask=binMask)

        return result

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
