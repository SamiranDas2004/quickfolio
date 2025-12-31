import httpx
import json
import os
import io
from typing import Dict, Any
from fastapi import UploadFile
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from docx import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "quickfolio-resumes")

pc = Pinecone(api_key=PINECONE_API_KEY) if PINECONE_API_KEY else None

def create_namespace(namespace_id: str):
    """Create a namespace in Pinecone for a new user"""
    if not pc:
        return False
    
    try:
        if PINECONE_INDEX not in pc.list_indexes().names():
            pc.create_index(
                name=PINECONE_INDEX,
                dimension=3072,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
        return True
    except Exception as e:
        print(f"Error creating namespace: {e}")
        return False

def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extract text from PDF, DOCX, or TXT files"""
    try:
        if filename.lower().endswith('.pdf'):
            pdf_reader = PdfReader(io.BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        elif filename.lower().endswith('.docx'):
            doc = Document(io.BytesIO(file_content))
            text = "\n".join([para.text for para in doc.paragraphs])
            return text.strip()
        else:
            return file_content.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error extracting text: {e}")
        return file_content.decode('utf-8', errors='ignore')

async def process_resume(file: UploadFile, username: str, namespace_id: str) -> Dict[str, Any]:
    """Process resume using OpenRouter API and store embeddings in Pinecone"""
    
    content = await file.read()
    resume_text = extract_text_from_file(content, file.filename or "resume.txt")
    
    print(f"\n=== RESUME PROCESSING START ===")
    print(f"Username: {username}")
    print(f"Namespace ID: {namespace_id}")
    print(f"Resume text length: {len(resume_text)} characters")
    print(f"Resume preview: {resume_text[:200]}...")
    
    extracted_data = await extract_resume_data(resume_text)
    
    print(f"\n=== EXTRACTED DATA ===")
    print(json.dumps(extracted_data, indent=2))
    
    if pc:
        await store_embeddings(namespace_id, username, extracted_data, resume_text)
    
    return extracted_data

async def extract_resume_data(resume_text: str) -> Dict[str, Any]:
    """Extract structured data from resume text using OpenRouter API"""
    
    prompt = f"""
You are a professional resume parsing engine.

Your task is to extract structured data from the resume text below and return ONLY valid JSON.

STRICT RULES:
- Do NOT guess or invent information.
- If a field is not explicitly found, return:
  - "" for strings
  - [] for arrays
  - {{}} for objects
- Extract ONLY technical/professional skills (no soft skills).
- Normalize all dates into: "Month Year - Month Year" or "Month Year - Present"
- Do NOT hallucinate social links. Include a link ONLY if it exists in the resume text.
- Do NOT include explanations, markdown, or extra text.

DATA EXTRACTION GUIDELINES:
- Name: Full name if present
- Title: Current or most recent professional role
- Bio: 2–3 concise professional sentences inferred from summary/objective/experience
- Skills: Programming languages, frameworks, databases, tools, platforms
- Experience:
  - Extract ALL roles
  - Keep descriptions concise and factual
- Projects:
  - Include personal, academic, or professional projects
  - Identify tech stack when possible
- Contact:
  - Extract email, phone, and location if present
- Social Links:
  - Only include links that are explicitly present in the resume text

RETURN THIS EXACT JSON STRUCTURE:
{{
  "name": "",
  "title": "",
  "bio": "",
  "skills": [],
  "experience": [
    {{
      "company": "",
      "position": "",
      "duration": "",
      "description": ""
    }}
  ],
  "projects": [
    {{
      "title": "",
      "description": "",
      "tech_stack": []
    }}
  ],
  "contact": {{
    "email": "",
    "phone": "",
    "location": ""
  }},
  "social_links": {{
    "linkedin": "",
    "github": "",
    "twitter": "",
    "website": ""
  }}
}}

RESUME TEXT:
{resume_text}

Return ONLY the JSON object.
"""

    
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is missing.")

    print(f"\n=== CALLING OPENROUTER API ===")
    print(f"Model: openai/gpt-4o-mini")
    print(f"Prompt length: {len(prompt)} characters")

    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-4o-mini",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 2000,
                    "temperature": 0.1
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"\n=== OPENROUTER RESPONSE ===")
                print(f"Status: {response.status_code}")
                
                content = result["choices"][0]["message"]["content"]
                print(f"Raw response length: {len(content)} characters")
                print(f"Raw response preview: {content[:300]}...")
                
                # Clean markdown formatting if present
                content = content.strip()
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                
                parsed_data = json.loads(content.strip())
                print(f"Parsed JSON successfully")
                return parsed_data
            else:
                print(f"\n=== OPENROUTER ERROR ===")
                print(f"Status: {response.status_code}")
                print(f"Response: {response.text}")
                return {}
                
        except Exception as e:
            print(f"Error processing resume: {e}")
            print(f"Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            return {}

# async def (text: str) -> list:
#     """Create embeddings using Groq API"""
#     print(f"\n=== CREATING EMBEDDINGS ===")
#     print(f"Text length: {len(text)} characters")
    
#     # Truncate text if too long (max 8000 chars for embedding)
#     if len(text) > 8000:
#         text = text[:8000]
#         print(f"Truncated to 8000 characters")
    
#     if not GROQ_API_KEY:
#         print("WARNING: No Groq API key, returning zero vector")
#         return [0.0] * 3072
    
#     # For now, create simple embeddings using text hashing
#     # In production, use a proper embedding model
#     import hashlib
#     hash_obj = hashlib.sha256(text.encode())
#     hash_bytes = hash_obj.digest()
    
#     # Create a pseudo-embedding by repeating and normalizing hash
#     embeddings = []
#     for i in range(3072):
#         embeddings.append(float(hash_bytes[i % len(hash_bytes)]) / 255.0)
    
#     print(f"Created hash-based embeddings: {len(embeddings)} dimensions")
#     print(f"First 5 values: {embeddings[:5]}")
#     return embeddings


async def create_embeddings(text: str) -> list:
    """Create real semantic embeddings using OpenRouter (OpenAI model)"""

    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is missing")

    if len(text) > 12000:
        text = text[:12000]

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/embeddings",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                # optional but recommended by OpenRouter
                "HTTP-Referer": "http://localhost",
                "X-Title": "Resume RAG"
            },
            json={
                "model": "openai/text-embedding-3-large",
                "input": text
            }
        )

        response.raise_for_status()
        embedding = response.json()["data"][0]["embedding"]

        if len(embedding) != 3072:
            raise ValueError(f"Expected 3072 dims, got {len(embedding)}")

        return embedding
    



async def store_embeddings(
    namespace_id: str,
    username: str,
    data: Dict[str, Any],
    resume_text: str
):
    """Store chunked resume embeddings in Pinecone using sentence-based splitting"""

    print(f"\n=== STORING EMBEDDINGS ===")
    print(f"Namespace: {namespace_id}")
    print(f"Username: {username}")

    if not pc:
        print("WARNING: Pinecone not initialized")
        return

    try:
        # Ensure index exists
        if PINECONE_INDEX not in pc.list_indexes().names():
            print(f"Creating new index: {PINECONE_INDEX}")
            pc.create_index(
                name=PINECONE_INDEX,
                dimension=3072,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )

        index = pc.Index(PINECONE_INDEX)

        # 🔹 Use LangChain RecursiveCharacterTextSplitter
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,        # characters per chunk
            chunk_overlap=100,     # overlap between chunks
            length_function=len,
        )
        chunks = splitter.split_text(resume_text)
        print(f"Total sentence-aware chunks created: {len(chunks)}")

        vectors = []

        for i, chunk in enumerate(chunks):
            embedding = await create_embeddings(chunk)

            if all(x == 0.0 for x in embedding):
                print(f"Skipping zero-vector chunk {i}")
                continue

            vectors.append((
                f"{username}_{i}",  # unique vector ID
                embedding,
                {
                    "username": username,
                    "chunk_index": i,
                    "resume_text": chunk,
                    "extracted_data": json.dumps(data)
                }
            ))

        if not vectors:
            print("ERROR: No valid vectors generated, skipping upsert")
            return

        print(f"Upserting {len(vectors)} vectors to Pinecone...")

        index.upsert(
            vectors=vectors,
            namespace=namespace_id
        )

        print("✅ Sentence-based chunked embeddings stored successfully")

    except Exception as e:
        print(f"Warning: Could not store embeddings: {e}")

async def query_user_data_stream(namespace_id: str, username: str, question: str, user_data: Dict[str, Any]):
    """Query user data with streaming response"""
    
    context = ""
    
    # Try to get context from Pinecone
    if pc:
        try:
            index = pc.Index(PINECONE_INDEX)
            query_embedding = await create_embeddings(question)
            
            results = index.query(
                vector=query_embedding,
                top_k=1,
                namespace=namespace_id,
                include_metadata=True
            )
            
            if results.matches:
                metadata = results.matches[0].metadata
                context = metadata.get("resume_text", "")
        except Exception as e:
            print(f"Error querying Pinecone: {e}")
    
    # Fallback to user data
    if not context:
        context = json.dumps(user_data, indent=2)
    
    # Generate response using LLM with streaming
    prompt = f"""You are an AI assistant representing {user_data.get('name', username)}. 
Answer questions about them based on the following information:

{context}

User question: {question}

Provide a natural, conversational response as if you are speaking on behalf of {user_data.get('name', username)}. Keep it concise and relevant."""
    
    if not OPENROUTER_API_KEY:
        yield "I'm sorry, I'm unable to answer questions at the moment."
        return
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            async with client.stream(
                "POST",
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 500,
                    "temperature": 0.7,
                    "stream": True
                }
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            if "choices" in chunk and len(chunk["choices"]) > 0:
                                delta = chunk["choices"][0].get("delta", {})
                                if "content" in delta:
                                    yield delta["content"]
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            print(f"Error generating response: {e}")
            yield "I'm having trouble answering that right now."

async def query_user_data(namespace_id: str, username: str, question: str, user_data: Dict[str, Any]) -> str:
    """Query user data using RAG with Pinecone and LLM"""
    
    print(f"\n=== QUERYING USER DATA ===")
    print(f"Namespace: {namespace_id}")
    print(f"Question: {question}")
    
    context = ""
    
    # Try to get context from Pinecone
    if pc:
        try:
            index = pc.Index(PINECONE_INDEX)
            query_embedding = await create_embeddings(question)
            
            results = index.query(
                vector=query_embedding,
                top_k=1,
                namespace=namespace_id,
                include_metadata=True
            )
            
            if results.matches:
                metadata = results.matches[0].metadata
                context = metadata.get("resume_text", "")
                print(f"Retrieved context from Pinecone: {len(context)} chars")
        except Exception as e:
            print(f"Error querying Pinecone: {e}")
    
    # Fallback to user data
    if not context:
        context = json.dumps(user_data, indent=2)
        print(f"Using user data as context")
    
    # Generate response using LLM
    prompt = f"""You are an AI assistant representing {user_data.get('name', username)}. 
Answer questions about them based on the following information:

{context}

User question: {question}

Provide a natural, conversational response as if you are speaking on behalf of {user_data.get('name', username)}. Keep it concise and relevant."""
    
    if not OPENROUTER_API_KEY:
        return "I'm sorry, I'm unable to answer questions at the moment."
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 500,
                    "temperature": 0.7
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                print(f"LLM API error: {response.status_code}")
                return "I'm having trouble answering that right now."
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I'm having trouble answering that right now."