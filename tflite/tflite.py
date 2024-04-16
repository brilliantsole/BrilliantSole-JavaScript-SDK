# based on https://github.com/googlecreativelab/tiny-motion-trainer/tree/main/backend

from flask import Flask, request, jsonify
import tensorflow as tf
import ssl
from flask_cors import CORS
import os

print(tf.__version__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/convert", methods=["POST"])
def convert_to_tflite():
    # Check if model.json and model.weights.bin files are in the request
    if "model.json" not in request.files or "model.weights.bin" not in request.files:
        return jsonify({"error": "Model files not provided"}), 400

    # Save model files from request
    model_json = request.files["model.json"]
    model_weights = request.files["model.weights.bin"]

    # Save model files to disk
    model_json.save("model.json")
    model_weights.save("model.weights.bin")

    # Load the TensorFlow model
    with open("model.json", "r") as f:
        model_json_content = f.read()
        model = tf.keras.models.model_from_json(model_json_content)

    model.load_weights("model.weights.bin")

    # Convert the TensorFlow model to TensorFlow Lite
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    tflite_model = converter.convert()

    # Save the TensorFlow Lite model to a file
    with open("converted_model.tflite", "wb") as f:
        f.write(tflite_model)

    # Delete the temporary model files
    os.remove("model.json")
    os.remove("model.weights.bin")

    # Return the path to the converted model file
    return jsonify({"converted_model_path": "converted_model.tflite"})


if __name__ == "__main__":
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain("./sec/cert.pem", "./sec/key.pem")
    app.run(host="0.0.0.0", port=8080, debug=True, ssl_context=context)

# [END app]
