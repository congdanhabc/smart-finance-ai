import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def parse_transaction(text: str):
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"Trích xuất thông tin tài chính từ câu sau: '{text}'. Trả về định dạng JSON gồm: amount, category, type (thu/chi), note. Chỉ trả về JSON."
    response = model.generate_content(prompt)
    return response.text