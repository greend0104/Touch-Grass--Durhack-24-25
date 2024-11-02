from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import base64
from clarifai_grpc.grpc.api import service_pb2, service_pb2_grpc, resources_pb2
from clarifai_grpc.grpc.api.status import status_code_pb2
from clarifai_grpc.channel.clarifai_channel import ClarifaiChannel

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

load_dotenv()
PAT = os.getenv("CLARIFAI_PAT")
if not PAT:
    raise Exception("PAT not found.")

USER_ID = 'clarifai'
APP_ID = 'main'
MODEL_ID = 'general-image-detection'
MODEL_VERSION_ID = '1580bb1932594c93b7e2e04456af7c6f'

channel = ClarifaiChannel.get_grpc_channel()
stub = service_pb2_grpc.V2Stub(channel)
metadata = (('authorization', 'Key ' + PAT),)
userDataObject = resources_pb2.UserAppIDSet(user_id=USER_ID, app_id=APP_ID)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    file_bytes = file.read()

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

    if post_model_outputs_response.status.code != status_code_pb2.SUCCESS:
        return jsonify({"error": post_model_outputs_response.status.description}), 500

    regions = post_model_outputs_response.outputs[0].data.regions
    results = []
    for region in regions:
        top_row = round(region.region_info.bounding_box.top_row, 3)
        left_col = round(region.region_info.bounding_box.left_col, 3)
        bottom_row = round(region.region_info.bounding_box.bottom_row, 3)
        right_col = round(region.region_info.bounding_box.right_col, 3)
        for concept in region.data.concepts:
            name = concept.name
            value = round(concept.value, 4)
            results.append({
                "name": name,
                "value": value,
            })

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
