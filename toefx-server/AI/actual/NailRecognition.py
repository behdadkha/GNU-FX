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
RECOGNITION_MODEL_COORD_ADJUSTMENT = 0.01  # Take 1% more of image on each side

# Colours for marking for nails located in an image
NAIL_BORDER_COLOURS = [(255, 0, 0),    # Red
                       (0, 255, 0),    # Green
                       (0, 255, 255),  # Blue
                       (120, 0, 255),  # Purple
                       (184, 184, 0)]  # Gold


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
                        # Take bounds adding offset of RECOGNITION_MODEL_COORD_ADJUSTMENT
                        (startY, startX, endY, endX) = boundary
                        startX = max(0, int((startX - RECOGNITION_MODEL_COORD_ADJUSTMENT) * width))
                        startY = max(0, int((startY - RECOGNITION_MODEL_COORD_ADJUSTMENT) * height))
                        endX = min(int((endX + RECOGNITION_MODEL_COORD_ADJUSTMENT) * width), width)
                        endY = min(int((endY + RECOGNITION_MODEL_COORD_ADJUSTMENT) * height), height)

                        output.append(baseImage[startY:endY, startX:endX])  # Crop to the nail
                        boundaryOutput.append((startX, startY, endX, endY))

                    return output, boundaryOutput

        return [], []  # No nails if not valid image path or input

    @staticmethod
    def IsolateHand(image: np.ndarray):
        """
        Applies skin colour binarization to the image. Anything that isn't skin colour is blotted out.
        :param image: The image to process.
        :return: A new image with the binarization applied.
        """

        if type(image) != np.ndarray:  # Input checking
            return image

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

        if type(nailImages) == list:  # Input checking
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

        paths = []  # The list of paths to the new images

        # Input checking
        if type(nailImages) != list \
                or type(originalPath) != str \
                or not os.path.isfile(originalPath):  # Error handling
            return paths

        # Get base file names for the new images
        baseSavePath = originalPath
        if "." in originalPath:  # Original image had an extension
            imageNameList = baseSavePath.split(".")
            baseSavePath = ".".join(imageNameList[:-1])

        # Save each image
        for i, image in enumerate(nailImages):
            suffix = "_{}".format(i)
            savePath = baseSavePath + suffix + ".png"  # Add suffix before extension - PNG is extension for lossless image quality
            if cv2.imwrite(savePath, image):  # Image was saved correctly
                paths.append(savePath)

        return paths

    @staticmethod
    def SaveNailColours(nailBounds: [(int, int)], originalPath: str) -> [(int, int, int)]:
        """
        Marks the boundaries where decomposed images were cropped from in a duplicate of the original image.
        The new image in saved in the same directory, with the format [ORIGINAL_NAME]_CLR.png where [ORIGINAL_NAME] is
        the name of the original image file.
        :param nailBounds: A list of (x, y) representing the starting coordinates for each cropping.
        :param originalPath: The path of the original image.
        :return: A list of colours (r, g, b) that each image was marked with.
        """

        colours = []  # The list of colours of the markings

        # Input checking
        if type(nailBounds) != list \
                or type(originalPath) != str \
                or not os.path.isfile(originalPath):
            return colours

        # Get filename of marked image
        savePath = originalPath
        if "." in originalPath:  # Original image had an extension
            imageNameList = savePath.split(".")
            savePath = ".".join(imageNameList[:-1])
        savePath += "_CLR.png"

        # Add markings to the original image
        markedImage = cv2.imread(originalPath, 1)
        for i, image in enumerate(nailBounds):
            startX, startY, finalX, finalY = nailBounds[i]

            reversedColour = NAIL_BORDER_COLOURS[i][::-1]  # CV2 reads the colours (b, g, r) instead of (r, g, b)
            markedImage = cv2.rectangle(markedImage, (startX, startY), (finalX, finalY), reversedColour, 10)
            colours.append(NAIL_BORDER_COLOURS[i])

        cv2.imwrite(savePath, markedImage)
        return colours

