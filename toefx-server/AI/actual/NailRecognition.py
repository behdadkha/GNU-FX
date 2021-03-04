"""
A class that locates nails in images and separates them out.
"""

import cv2
import tensorflow as tf
import numpy as np
import os

# Load a pre-trained model downloaded from https://github.com/ManWingloeng/nailtracking
# It is used instead of an image rotation model.
RECOGNITION_MODEL_PATH = os.path.dirname(os.path.realpath(__file__)) + "/models/NailRecognitionModel.pb"
RECOGNITION_MODEL_MIN_CONFIDENCE = 0.6
NAIL_BORDER_COLOURS = [(255, 0, 0), (0, 255, 0), (0, 255, 255), (120, 0, 255), (184, 184, 0)]


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
    def GetNailsFromImage(imagePath: str) -> [[np.ndarray], [(int, int)]]:
        """
        Finds each nail in an image and returns them in a list.
        :param imagePath: The path to an image with nails to parse.
        :return: A list of nail images for each nail found in the original image.
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
                    boundaryOutput = []  # A list of starting crop coords

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
                        boundaryOutput.append((startX, startY))

                    return output, boundaryOutput

        return [[], []]  # No nails if not valid image path or input

    @staticmethod
    def IsolateHand(image: np.ndarray):
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
        :param nailImages: A series of nail images created by GetNailsFromImage.
        :return: Whether or not any nails were actually found in the original image.
        """

        if type(nailImages) == list:  # Error handling
            return len(nailImages) >= 1

        return False  # No nails if not valid input

    @staticmethod
    def SaveNailImages(nailImages: [np.ndarray], originalPath: str) -> [str]:
        """
        Saves a list of cropped nail images to the server. Images are saved in the same location
        as the original image.
        :param nailImages: The list of images to save.
        :param originalPath: The path of the original image.
        :return: A list of paths to the new images.
        """

        paths = []

        if type(nailImages) != list \
                or type(originalPath) != str \
                or not os.path.isfile(originalPath):  # Error handling
            return paths

        baseSavePath = originalPath
        if "." in originalPath:  # Original image had an extension
            imageNameList = baseSavePath.split(".")
            baseSavePath = ".".join(imageNameList[:-1])

        for i, image in enumerate(nailImages):
            suffix = "_{}".format(i)
            savePath = baseSavePath + suffix + ".png"  # Add suffix before extension - PNG is extension for lossless image quality
            if cv2.imwrite(savePath, image):  # Image was saved correctly
                paths.append(savePath)

        return paths

    @staticmethod
    def SaveNailColours(nailImages: [np.ndarray], nailBounds: [(int, int)], originalPath: str) -> [str]:
        """
        DOCS TODO
        """
        colours = []

        if type(nailImages) != list \
                or type(originalPath) != str \
                or not os.path.isfile(originalPath):  # Error handling
            return colours

        baseSavePath = originalPath
        if "." in originalPath:  # Original image had an extension
            imageNameList = baseSavePath.split(".")
            baseSavePath = ".".join(imageNameList[:-1])

        savePath = baseSavePath + "_CLR.png"

        originalImage = cv2.imread(originalPath, 1)
        for i, image in enumerate(nailImages):
            startX, startY = nailBounds[i]
            finalX = startX + image.shape[1]
            finalY = startY + image.shape[0]

            reversedColour = NAIL_BORDER_COLOURS[i][::-1]
            originalImage = cv2.rectangle(originalImage, (startX, startY), (finalX, finalY), reversedColour, 2)
            colours.append(NAIL_BORDER_COLOURS[i])

        cv2.imwrite(savePath, originalImage)
        return colours



