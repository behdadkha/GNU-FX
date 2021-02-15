"""
The main script run by the server.
"""

import json
import sys

from FungalCoverage import *
from NailRecognition import *


def returnData(data):
    retVal = {"data": data}
    print(json.dumps(retVal))


def main():
    """
    Input is Interface.py COMMAND FILE_PATH
    """
    if len(sys.argv) > 1:  # Has command
        command = sys.argv[1].upper()
        if command == "DECOMPOSE":
            if len(sys.argv) > 2:  # Has image path
                imagePath = sys.argv[2]
                images = NailRecognition.GetNailsFromImage(imagePath)
                imagePaths = NailRecognition.SaveNailImages(images, imagePath)
                returnData(imagePaths)
                return
        elif command == "COVERAGE":
            if len(sys.argv) > 2:  # Has image path
                imagePath = sys.argv[2]
                coverage = FungalCoverage.CalculateCoverage(imagePath)
                returnData(round(coverage, 1))  # Round to 1 decimal place
                return

    returnData("")  # Nothing to return


if __name__ == '__main__':
    main()
