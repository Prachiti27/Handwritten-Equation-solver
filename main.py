from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64

app = FastAPI(title="Handwritten Equation Solver ")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ImagePayload(BaseModel):
    image: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/predict")
def receive_image(payload: ImagePayload):
    image_data = payload.image.split(",")[1]
    image_bytes = base64.b64decode(image_data)
    
    with open("received.png","wb") as f:
        f.write(image_bytes)
        
    return {"message": "Image received successfully."}
    