from fastapi import FastAPI
from pydantic import BaseModel
import openai

openai.api_key = "YOUR_OPENAI_API_KEY"

app = FastAPI()

class Prompt(BaseModel):
    text: str

fine_tuned_model = "curie:ft-your-org:taxonomy-classifier-2026-02-28"

@app.post("/classify")
def classify(prompt: Prompt):
    response = openai.ChatCompletion.create(
        model=fine_tuned_model,
        messages=[
            {"role": "system", "content": "Classify student prompts using taxonomy -3 to +2. Return JSON with value and suggestion."},
            {"role": "user", "content": prompt.text}
        ],
        temperature=0
    )
    return {"result": response.choices[0].message.content}