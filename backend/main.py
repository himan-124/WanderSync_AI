import os
import json
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from google import genai 
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="WanderSync AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    client = genai.Client(api_key=api_key)

class VibeRequest(BaseModel):
    vibe: str
    days: int = 3
    lat: float = None
    lng: float = None

@app.get("/")
def read_root():
    return {"message": "Backend is running flawlessly!"}

@app.post("/generate-plan")
def generate_plan(request: VibeRequest):
    if not api_key:
        return {"error": "API Key missing!"}
        
    location_context = f"User is at Latitude: {request.lat}, Longitude: {request.lng}." if request.lat else "User location not provided."

    prompt = f"""
    You are an expert GenZ travel planner. 
    User's vibe: '{request.vibe}'. Trip duration: {request.days} days.
    {location_context}
    
    CRITICAL INSTRUCTIONS:
    1. Return strictly a raw JSON object.
    2. Do NOT wrap it in ```json or any markdown.
    3. Do NOT use any double quotes inside the text values (use single quotes ' if needed).
    4. Format exactly like this:
    {{
      "destination": "Name of the place, State",
      "distance": "Distance and transport details",
      "budget": "Estimated budget in INR",
      "itinerary": "Detailed day-wise plan."
    }}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # 1. AI ki Markdown formatting ko zabardasti hatana
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        
        # 2. JSON ke start { aur end } ko pakadna
        start = clean_text.find('{')
        end = clean_text.rfind('}')
        
        if start != -1 and end != -1:
            clean_json = clean_text[start:end+1]
            
            # THE ULTIMATE FIX: strict=False allows AI's weird newlines and formats
            plan_data = json.loads(clean_json, strict=False)
            
            return {"status": "success", "data": plan_data}
        else:
            raise ValueError("No JSON structure found.")
            
    except Exception as e:
        error_msg = str(e)
        print("============= BACKEND ERROR =============")
        print(error_msg)
        print("RAW AI RESPONSE WAS:")
        print(response.text if 'response' in locals() else "No response generated")
        print("=========================================")
        
        return {"status": "error", "message": "AI ne format bigad diya. Ek baar fir se click karo!"}