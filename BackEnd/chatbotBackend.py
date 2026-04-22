from flask import Flask, jsonify, request
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("API_KEY")
client = OpenAI(api_key=API_KEY)

SYSTEM_PROMPT = """
You are a customer service chatbot. Your name is Sara. Your task is to assist users with their inquiries and provide helpful information. Please give them generic return instructions within a 30 day policy to techLife
"""

conversation_history = []

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message")

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    conversation_history.append({
        "role": "user",
        "content": user_message
    })

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            *conversation_history
        ]
    )

    assistant_message = response.choices[0].message.content

    conversation_history.append({
        "role": "assistant",
        "content": assistant_message
    })

    return jsonify({"reply": assistant_message})

@app.route("/reset", methods=["POST"])
def reset():
    conversation_history.clear()
    return jsonify({"status": "conversation reset"})
