"""
The main script run by the server.
"""

import json
import sys

from FungalCoverage import *
from NailRecognition import *


def returnData(data):
    """
    Formats and outputs the data to be sent back to Node.js.
    :param data: The data to be returned. Can be any type.
    """

    retVal = {"data": data}
    print(json.dumps(retVal))


def main():
    """
    Input is Interface.py COMMAND FILE_PATH
    COMMAND can be:
        TRAIN:     Trains the fungal coverage model.
        DECOMPOSE: Breaks an image into smaller images with single nails. If no nails are in the image loaded from
                   FILE_PATH, then this returns an empty list.
        COVERAGE:  Calculates the fungal coverage on a nail. Ideally should only be called on images that have gone
                   through DECOMPOSE first. Returns a list of floats of the coverage values.
    """

    if len(sys.argv) > 1:  # Has command
        command = sys.argv[1].upper()
        if command == "TRAIN":
            FungalCoverage.TrainModel()
        elif command == "DECOMPOSE":
            if len(sys.argv) > 2:  # Has image path
                imagePath = sys.argv[2]
                images = NailRecognition.GetNailsFromImage(imagePath)
                imagePaths = NailRecognition.SaveNailImages(images, imagePath)
                returnData(imagePaths)
                return
        elif command == "COVERAGE":
            if len(sys.argv) > 2:  # Has image path
                coverages = []
                for imagePath in sys.argv[2:]:  # Allows quicker processing of multiple images
                    coverage = FungalCoverage.CalculateCoverage(imagePath)
                    coverages.append(round(coverage, 1))  # Round to 1 decimal place
                returnData(coverages)
                return

    returnData("")  # Nothing to return


if __name__ == '__main__':
    main()
