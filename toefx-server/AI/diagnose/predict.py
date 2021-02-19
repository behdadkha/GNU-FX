# THIS FILE IS JUST TEMPORARY
# No test cases have been written for the code in this file.
# All AI code can be found in toefx-server/AI/actual
# Please do not mark it.

import tensorflow as tf 
from tensorflow import keras
from tensorflow.keras.preprocessing import image
from tensorflow.keras.optimizers import RMSprop
#import matplotlib.pyplot as plt 
import numpy as np 
import os
import sys


imageName = sys.argv[1]

img = keras.preprocessing.image.load_img(imageName, target_size=(150,150))

img_array = keras.preprocessing.image.img_to_array(img)
img_array = tf.expand_dims(img_array,0)

model = tf.keras.models.load_model("first.model")
catagory = ['healthy', 'unhealthy']

predictions = model.predict(img_array)
score = tf.nn.softmax(predictions[0])
print(catagory[np.argmax(score)], score)
'''plt.grid(False)
plt.imshow(prepare(), cmap=plt.cm.binary)
plt.show()'''


