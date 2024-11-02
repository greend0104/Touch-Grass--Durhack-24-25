import os
from dotenv import load_dotenv
from clarifai_grpc.grpc.api import service_pb2, service_pb2_grpc
from clarifai_grpc.grpc.api.status import status_code_pb2
from clarifai_grpc.grpc.api.resources_pb2 import Input
from clarifai_grpc.channel.clarifai_channel import ClarifaiChannel

# Load environment variables from .env file
load_dotenv()

pat = os.getenv("CLARIFAI_PAT")

# Set up the Clarifai gRPC channel and stub
channel = ClarifaiChannel.get_grpc_channel()
stub = service_pb2_grpc.V2Stub(channel)

# Set up the metadata with your PAT
metadata = (("authorization", f"Key {pat}"),)

# Define the request for getting concepts
request = service_pb2.ListConceptsRequest(
    user_app_id=service_pb2.UserAppIDSet(user_id="YOUR_USER_ID", app_id="YOUR_APP_ID")
)

# Make the API call
response = stub.ListConcepts(request, metadata=metadata)

if response.status.code != status_code_pb2.SUCCESS:
    print(f"Failed to get concepts: {response.status.description}")
    exit(1)

# Print the list of concepts
for concept in response.concepts:
    print(f"ID: {concept.id}, Name: {concept.name}")
