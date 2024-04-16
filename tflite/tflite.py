# based on https://github.com/googlecreativelab/tiny-motion-trainer/tree/main/backend

import os
import shutil
import sys
import subprocess
import io
import time
import logging
import tarfile
from flask import Flask, request, send_file, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import shortuuid
import tensorflow as tf
import numpy as np
import json
import ssl

print(tf.__version__)

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "tflite/uploads/"
CORS(app, resources={r"/*": {"origins": "*"}})


def tfjs_to_keras(json_file):
    base_path = os.path.splitext(json_file)[0]
    out_file = base_path + '.hdf5'
    result = subprocess.check_output(['tensorflowjs_converter', '--input_format=tfjs_layers_model',
                                      '--output_format=keras', json_file, out_file])
    print(result)
    return out_file

def keras_to_tflite(bin_file, quantize=False, quantize_data=None):
    # Convert the model.
    model = tf.keras.models.load_model(bin_file)
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    if quantize:
        print('QUANTIZE: TRUE')
        print(quantize_data)

        def representative_dataset_generator():
            for value in quantize_data:
                # Each scalar value must be inside of a 2D array that is wrapped in a list
                yield [np.array(value, dtype=np.float32, ndmin=2)]

        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.representative_dataset = representative_dataset_generator
        # converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8] # For EdgeTPU, no float ops allowed
        # converter.inference_input_type = tf.uint8
        # converter.inference_output_type = tf.uint8
    else:
        print('QUANTIZE: FALSE')
    tflite_model = converter.convert()

    base_path = os.path.splitext(bin_file)[0]
    out_file = base_path + ".tflite"

    # Save the TF Lite model.
    with tf.io.gfile.GFile(out_file, 'wb') as f:
        f.write(tflite_model)
    return out_file


def tflite_to_c(tflite_file, out_folder):
    base_path = os.path.splitext(tflite_file)[0]
    out_path = os.path.join(out_folder, 'tfLite_model.cpp')

    c_array = "#include \"tfLite_model.h\"\n\n"
    c_array += "unsigned char tfLite_model[] = {\n"

    ps = subprocess.Popen(('cat', tflite_file), stdout=subprocess.PIPE)
    output = subprocess.check_output(('xxd', '-i'), stdin=ps.stdout)
    ps.wait()

    output_string = output.decode().rstrip('\n')
    c_array += output_string
    c_array += "\n};\n\n"

    c_array += f"const unsigned int tfLite_model_length = {output_string.count(',')+1};"

    with open(out_path, 'w') as f:
        f.write(c_array)

    return c_array


def make_tarfile(tmp_dir):
    timestr = time.strftime("%Y%m%d-%H%M%S")
    output_filename = os.path.join(tmp_dir, 'final.tgz')
    with tarfile.open(output_filename, "w:gz") as tar:
        tar.add(tmp_dir, arcname=os.path.sep)
    return output_filename


def get_and_remove_file(file_path):
    return_data = io.BytesIO()
    with open(file_path, 'rb') as fo:
        return_data.write(fo.read())

    # (after writing, cursor will be at last byte, so move it to start)
    return_data.seek(0)
    os.remove(file_path)

    return return_data


@ app.route('/')
def hello_world():
    return 'Hello, World!'

@ app.route('/convert', methods=['POST'])
def upload_file():
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    tmp_dir = app.config['UPLOAD_FOLDER'] + shortuuid.uuid() + '/'
    os.mkdir(tmp_dir)

    error = None
    file_data = None
    if request.method == 'POST':
        # try:
        print(request.files)
        f = request.files['model.weights.bin']
        weights_path = tmp_dir + secure_filename(f.filename)
        f.save(weights_path)
        f = request.files['model.json']
        json_path = tmp_dir + secure_filename(f.filename)
        f.save(json_path)

        # convert to keras
        keras_path = tfjs_to_keras(json_path)

        quantize = request.args.get('quantize', type=bool, default=False)
        quantize_data_str = request.form.get(
            'quantize_data', type=str, default=None)
        quantize_data = None

        if quantize_data_str:
            quantize_data = json.loads(quantize_data_str)

        tflite_path = keras_to_tflite(keras_path, quantize, quantize_data)

        # doesn't work on windows...
        # c_header_path = tflite_to_c(tflite_path, tmp_dir)

        tar_file = make_tarfile(tmp_dir)
        file_data = get_and_remove_file(tar_file)
        shutil.rmtree(tmp_dir)
        print(error)
        if error:
            return sys.exc_info()[0]
        else:
            timestr = time.strftime("%Y%m%d-%H%M%S")
            output_filename = 'conversion-' + timestr + '.tgz'
            print("sending", output_filename)
            return send_file(file_data, mimetype='application/tar+gzip', attachment_filename=output_filename)



@app.errorhandler(500)
def server_error(e):
    # Log the error and stacktrace.
    logging.exception("An error occurred during a request.")
    return "An internal error occurred.", 500


if __name__ == "__main__":
    print("uploads will go to " + app.config["UPLOAD_FOLDER"])
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain("./sec/cert.pem", "./sec/key.pem")
    app.run(host="0.0.0.0", port=8080, debug=True, ssl_context=context)

# [END app]
