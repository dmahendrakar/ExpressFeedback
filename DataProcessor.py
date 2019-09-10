import os
import keras
import collections
import numpy as np

joints_index = ['head', 'neck', 'Rsho', 'Relb', 'Rwri','Lsho', 'Lelb', 'Lwri','Rhip', 'Rkne', 'Rank','Lhip', 'Lkne', 'Lank']

def read_data(data_path, UNFOLD_SIZE, CATEGORIES):
    data = {}
    for cat in CATEGORIES:
        data[cat] = []

    # chunk data
    for file in os.listdir(data_path):
        if file.startswith('.'):
            continue

        category = file.split('video')[0]

        skip_file = False
        g_trajectories = []
        # open file and read first line
        for line in open(os.path.join(data_path,file)):
            trajectory = map(lambda x: x, map(float, line.strip().split(',')))

            if len(trajectory) < UNFOLD_SIZE:
                skip_file = True
                break

            if not len(trajectory) % UNFOLD_SIZE: # zero pad
                trajectory.extend([0]*(len(trajectory) % UNFOLD_SIZE))

            split_trajectories = []
            for i in range((len(trajectory) / UNFOLD_SIZE)-1):
                split_trajectories.append(trajectory[i*UNFOLD_SIZE:(i+1)*UNFOLD_SIZE])
            g_trajectories.append(split_trajectories)

        if skip_file:
            continue

        # create json data
        one_split_trajectory = {}
        for i in range((len(trajectory) / UNFOLD_SIZE)-1): # because a file has same trajectory size
            for line, joint_trajectory in enumerate(g_trajectories):
                one_split_trajectory[joints_index[line]] = joint_trajectory[i]

            data[category].append(one_split_trajectory)

    # split data
    input_train = []
    target_train = []
    input_test = []
    target_test = []
    input_validation = []
    target_validation = []

    input_data = []
    output_data = []

    categories = CATEGORIES

    for category, videos_data in data.items():
        print category, len(videos_data)

        for video_data in videos_data[:int(len(videos_data) * 0.7)]:
            video_data = collections.OrderedDict(sorted(video_data.items()))

            # ignoring the categories for now
            joint_trajectories = np.transpose(np.array(video_data.values()))

            input_train.append(joint_trajectories)
            target_train.extend([categories.index(category)])

        for video_data in videos_data[int(len(videos_data) * 0.7):int(len(videos_data) * 0.9)]:
            video_data = collections.OrderedDict(sorted(video_data.items()))

            # ignoring the categories for now
            joint_trajectories = np.transpose(np.array(video_data.values()))

            input_validation.append(joint_trajectories)
            target_validation.extend([categories.index(category)])

        for video_data in videos_data[int(len(videos_data) * 0.9):]:
            video_data = collections.OrderedDict(sorted(video_data.items()))

            # ignoring the categories for now
            joint_trajectories = np.transpose(np.array(video_data.values()))

            input_test.append(joint_trajectories)
            target_test.extend([categories.index(category)])

    input_train = np.array(input_train).reshape(len(input_train),UNFOLD_SIZE,14)
    input_validation = np.array(input_validation).reshape(len(input_validation),UNFOLD_SIZE,14)
    input_test = np.array(input_test).reshape(len(input_test),UNFOLD_SIZE,14)

    target_train = np.array(target_train)
    target_validation = np.array(target_validation)
    target_test = np.array(target_test)

    # split input
    return (input_train, target_train), (input_validation, target_validation), (input_test, target_test)

def load_data(data_path, UNFOLD_SIZE, CATEGORIES):
    NUM_CLASSES = len(CATEGORIES)
    (x_train, y_train), (x_validation, y_validation), (x_test, y_test) = read_data(data_path, UNFOLD_SIZE, CATEGORIES)

    # Reshapes data to 4D for Hierarchical RNN. ?
    x_train = x_train.reshape(x_train.shape[0], UNFOLD_SIZE, 14, 1)
    x_validation = x_validation.reshape(x_validation.shape[0], UNFOLD_SIZE, 14, 1)
    x_test = x_test.reshape(x_test.shape[0], UNFOLD_SIZE, 14, 1)
    x_train = x_train.astype('float32')
    x_validation = x_validation.astype('float32')
    x_test = x_test.astype('float32')
    print('x_train shape:', x_train.shape)
    print(x_train.shape[0], 'train samples')
    print(x_test.shape[0], 'test samples')

    # Converts class vectors to binary class matrices.
    y_train = keras.utils.to_categorical(y_train, NUM_CLASSES)
    y_validation = keras.utils.to_categorical(y_validation, NUM_CLASSES)

    y_test = keras.utils.to_categorical(y_test, NUM_CLASSES)

    return (x_train, y_train), (x_validation, y_validation), (x_test, y_test)

def split_by_part(joints, data):
    joint1, joint2, joint3 = joints
    _data = []
    for d in data:
        _data.append(
            np.concatenate(
                [
                    d[:, joints_index.index(joint1)],
                    d[:, joints_index.index(joint2)],
                    d[:, joints_index.index(joint3)]
                ]
            )
        )
    _data = np.array(_data)
    _data = np.concatenate(
        [
            data[:,:, joints_index.index(joint1)],
            data[:,:, joints_index.index(joint2)],
            data[:,:, joints_index.index(joint3)]
        ]
    )
    #_data = _data.reshape(3, data.shape[0], data.shape[1]).transpose()

    # Reshapes data to 4D for Hierarchical RNN. ?
    _data = _data.reshape(data.shape[0], data.shape[1], 3, 1)
    _data = _data.astype('float32')

    return _data

if __name__ == '__main__':
    (x_train, y_train), (x_test, y_test) = load_data('./RBHNN_dataset', 0.9, 50)
    print 'done'