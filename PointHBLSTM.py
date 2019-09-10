"""This is an example of using Hierarchical RNN (HRNN) to classify MNIST digits.
HRNNs can learn across multiple levels of temporal hiearchy over a complex sequence.
Usually, the first recurrent layer of an HRNN encodes a sentence (e.g. of word vectors)
into a  sentence vector. The second recurrent layer then encodes a sequence of
such vectors (encoded by the first layer) into a document vector. This
document vector is considered to preserve both the word-level and
sentence-level structure of the context.
# References
    - [A Hierarchical Neural Autoencoder for Paragraphs and Documents](https://arxiv.org/abs/1506.01057)
        Encodes paragraphs and documents with HRNN.
        Results have shown that HRNN outperforms standard
        RNNs and may play some role in more sophisticated generation tasks like
        summarization or question answering.
    - [Hierarchical recurrent neural network for skeleton based action recognition](http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=7298714)
        Achieved state-of-the-art results on skeleton based action recognition with 3 levels
        of bidirectional HRNN combined with fully connected layers.
In the below MNIST example the first LSTM layer first encodes every
column of pixels of shape (28, 1) to a column vector of shape (128,). The second LSTM
layer encodes then these 28 column vectors of shape (28, 128) to a image vector
representing the whole image. A final Dense layer is added for prediction.
After 5 epochs: train acc: 0.9858, val acc: 0.9864
"""
from __future__ import print_function

import numpy as np
from keras.models import Model
from keras.layers import Input, Dense, TimeDistributed
from keras.layers import LSTM, Bidirectional
from keras.layers.core import Dropout
from keras.layers import Merge
from keras.models import load_model

import itertools
import numpy as np
import matplotlib.pyplot as plt

from sklearn import svm, datasets
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix

from DataProcessor import load_data

# Training parameters.
batch_size = 32
NUM_CLASSES = 6
CATEGORIES = ['boxing','clapping','waving','jogging','running','walking']
UNFOLD_SIZE = 50
epochs = 100

# Embedding dimensions.
row_hidden = 128
col_hidden = 128

def train(model_file):

    train_data , validation_data, test_data = load_data('./RBHNN_dataset', UNFOLD_SIZE, CATEGORIES)
    row, col, pixel = train_data[0].shape[1:]

    # 4D input.
    x = Input(shape=(row, col, pixel))
    b1 = TimeDistributed(Bidirectional(LSTM(row_hidden, dropout=0.2)))(x)
    # Encodes a row of pixels using TimeDistributed Wrapper.
    encoded_rows = Bidirectional(LSTM(row_hidden, return_sequences=True, dropout=0.2))(b1)

    # Encodes columns of encoded rows.
    b2 = Bidirectional(LSTM(col_hidden, return_sequences=True, dropout=0.2))(encoded_rows)
    encoded_columns = Bidirectional(LSTM(col_hidden, dropout=0.2))(b2)

    # Final predictions and model.
    prediction = Dense(NUM_CLASSES, activation='softmax')(encoded_columns)
    model = Model(x, prediction)
    model.compile(loss='categorical_crossentropy',
                  optimizer='rmsprop',
                  metrics=['accuracy'])

    # Print model configuration.
    model.summary()

    # Training.
    model.fit(train_data[0], train_data[1],
              batch_size=batch_size,
              epochs=epochs,
              verbose=1,
              validation_data=(validation_data[0], validation_data[1]))

    scores = model.evaluate(test_data[0], test_data[1], verbose=0)
    print('Test loss:', scores[0])
    print('Test accuracy:', scores[1])

    model.save(model_file)


    # train_data , validation_data, test_data = load_data('./testdata', 1.0, UNFOLD_SIZE, CATEGORIES)

    # Evaluation.
    y_test = []; y_pred = [];
    scores = model.evaluate(test_data[0], test_data[1], verbose=0)
    print('Test loss:', scores[0])
    print('Test accuracy:', scores[1])

    for val, cat in zip(test_data[0],test_data[1]):
        pred = model.predict(np.array(val).reshape(1,UNFOLD_SIZE,14,1))
        y_test.append(np.argmax(cat)+1)
        y_pred.append(np.argmax(pred[0])+1)
        print(pred, CATEGORIES[np.argmax(pred[0])], CATEGORIES[np.argmax(cat)])

    show_confusion_matrix(y_test, y_pred)

def plot_confusion_matrix(cm, classes,
                          normalize=False,
                          title='Confusion matrix',
                          cmap=plt.cm.Blues):
    """
    This function prints and plots the confusion matrix.
    Normalization can be applied by setting `normalize=True`.
    """
    plt.imshow(cm, interpolation='nearest', cmap=cmap)
    plt.title(title)
    plt.colorbar()
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=45)
    plt.yticks(tick_marks, classes)

    if normalize:
        cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        print("Normalized confusion matrix")
    else:
        print('Confusion matrix, without normalization')

    print(cm)

    thresh = cm.max() / 2.
    for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
        plt.text(j, i, format(cm[i, j], '.3f'),
                 horizontalalignment="center",
                 color="white" if cm[i, j] > thresh else "black")

    plt.tight_layout()
    plt.ylabel('True label')
    plt.xlabel('Predicted label')

def show_confusion_matrix(y_test, y_pred):
    cnf_matrix = confusion_matrix(y_test, y_pred)
    np.set_printoptions(precision=2)

    # Plot non-normalized confusion matrix
    plt.figure()
    plot_confusion_matrix(cnf_matrix, classes=CATEGORIES,
                          title='Confusion matrix, without normalization')

    # Plot normalized confusion matrix
    plt.figure()
    plot_confusion_matrix(cnf_matrix, classes=CATEGORIES, normalize=True,
                          title='Normalized confusion matrix')

    plt.show()

def test(model_file):
    model = load_model('point_b32_e1_h128.h5')


    train_data , validation_data, test_data = load_data('./testdata', 1.0, UNFOLD_SIZE, CATEGORIES)

    # Evaluation.
    scores = model.evaluate(train_data[0], train_data[1], verbose=0)
    print('Test loss:', scores[0])
    print('Test accuracy:', scores[1])

    for val, cat in zip(train_data[0],train_data[1]):
        pred = model.predict(np.array(val).reshape(1,UNFOLD_SIZE,14,1))
        print(pred, CATEGORIES[np.argmax(pred[0])], CATEGORIES[np.argmax(cat)])

if __name__ == '__main__':
    model_file = "point_b{0}_e{1}_h{2}.h5".format(batch_size, epochs, row_hidden)
    train(model_file)
    # test(model_file)