################################################
# Import necessary libraries and modules
# Flask is for wrapping the Python script in a backend server.
# Run `pip install flask-cors` to install Flask-CORS.
# Run `pip install Flask` to install Flask.
################################################

from flask import Flask, request, jsonify
from flask_cors import CORS

################################################
# Import dotenv to load environment variables from a .env file
# Run `python -m pip install python-dotenv` to install python-dotenv.
# In the .env file, add a line like CLARIFAI_PAT="your_api_key".
# You can get the API key by signing up at clarifai.com.
# A free community account gives 1000 usages per month for free.
# Go to https://clarifai.com/clarifai/main/models/general-image-detection,
# click "Use Model", then "Call by API", "Python", create a new token,
# and follow the steps to get your API key.
################################################

from dotenv import load_dotenv
import os

################################################
# Import necessary libraries for Clarifai image recognition
# Run `pip install clarifai-grpc` to install Clarifai gRPC.
################################################

import base64
from clarifai_grpc.grpc.api import service_pb2, service_pb2_grpc, resources_pb2
from clarifai_grpc.grpc.api.status import status_code_pb2
from clarifai_grpc.channel.clarifai_channel import ClarifaiChannel
import random

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Load environment variables from .env file
load_dotenv()
PAT = os.getenv("CLARIFAI_PAT")
if not PAT:
    raise Exception("PAT not found.")

# Set Clarifai user and app details, this is the same for everyone
USER_ID = 'clarifai'
APP_ID = 'main'
MODEL_ID = 'general-image-detection'
MODEL_VERSION_ID = '1580bb1932594c93b7e2e04456af7c6f'

# Set up Clarifai gRPC channel and stub
# This section initializes the gRPC channel and stub to communicate with the Clarifai server.
# It also sets up the authorization metadata and user/app details for API requests.
channel = ClarifaiChannel.get_grpc_channel()
stub = service_pb2_grpc.V2Stub(channel)
metadata = (('authorization', 'Key ' + PAT),)
userDataObject = resources_pb2.UserAppIDSet(user_id=USER_ID, app_id=APP_ID)

# defines route for predict function and sets the /predict endpoint in the html
# as the endpoint to handle POST requests
@app.route('/predict', methods=['POST'])

################################################
# Handle POST requests to the /predict endpoint.
#
# Arguments:
# None (Flask automatically passes the request object)
#
# Returns:
# JSON response containing the prediction results or an error message.
#
# This function:
# - Checks if a file is included in the request.
# - Reads the file and sends it to the Clarifai API for image recognition.
# - Processes the API response to extract and format the prediction results.
# - Returns the results as a JSON response.
################################################
def predict():
    # Check if a file is part of the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    file_bytes = file.read()

    # Send image to Clarifai for prediction
    post_model_outputs_response = stub.PostModelOutputs(
        service_pb2.PostModelOutputsRequest(
            user_app_id=userDataObject,
            model_id=MODEL_ID,
            version_id=MODEL_VERSION_ID,
            inputs=[
                resources_pb2.Input(
                    data=resources_pb2.Data(
                        image=resources_pb2.Image(
                            base64=file_bytes
                        )
                    )
                )
            ]
        ),
        metadata=metadata
    )

    # Check if the response from Clarifai is successful
    if post_model_outputs_response.status.code != status_code_pb2.SUCCESS:
        return jsonify({"error": post_model_outputs_response.status.description}), 500

    # Process the response and extract regions and concepts
    regions = post_model_outputs_response.outputs[0].data.regions
    results = []
    for region in regions:
        top_row = round(region.region_info.bounding_box.top_row, 3)
        left_col = round(region.region_info.bounding_box.left_col, 3)
        bottom_row = round(region.region_info.bounding_box.bottom_row, 3)
        right_col = round(region.region_info.bounding_box.right_col, 3)
        for concept in region.data.concepts:
            name = concept.name
            results.append({
                "name": name
            })

    # Return the results as a JSON response
    return jsonify(results)

if __name__ == '__main__':
    # Run the Flask app in debug mode
    app.run(debug=True)
