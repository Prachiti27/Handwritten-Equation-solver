from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import cv2
import numpy as np
import os

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
    
def segment_symbols(image_path: str, output_dir: str = "symbols"):
    os.makedirs(output_dir, exist_ok=True)
    
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    _, thresh = cv2.threshold(
        gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU 
    )
    
    contours, _ = cv2.findContours(
        thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    
    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])
    
    for idx, contour in enumerate(contours):
        x, y, w, h = cv2.boundingRect(contour)
        
        if w<5 or h<5:
            continue
        
        symbol = thresh[y:y+h, x:x+w]
        symbol = cv2.resize(symbol, (28, 28))
        
        cv2.imwrite(f"{output_dir}/symbol_{idx}.png", symbol)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/predict")
def receive_image(payload: ImagePayload):
    image_data = payload.image.split(",")[1]
    image_bytes = base64.b64decode(image_data)
    
    image_path = "received.png"
    
    with open(image_path,"wb") as f:
        f.write(image_bytes)
        
    segment_symbols(image_path)
        
    return {"message": "Image received successfully."}
    