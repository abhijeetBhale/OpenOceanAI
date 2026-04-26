# RAG Document Scanner & AI Interview Platform

## A Comprehensive Technical Documentation

---

# Chapter 1: INTRODUCTION

## 1.1 Introduction

This project, **RAG Document Scanner & AI Interview Platform**, represents a significant advancement in intelligent document analysis systems. It combines the power of Retrieval-Augmented Generation (RAG) technology, Large Language Models (LLM), and Optical Character Recognition (OCR) to create a comprehensive platform for document processing, intelligent questioning, and job matching capabilities.

### 1.1.1 Project Overview

The RAG Document Scanner & AI Interview Platform is designed to streamline document-based workflows for job seekers, medical professionals, financial analysts, and educational institutions. The system enables users to upload various document types—including PDFs and images—and automatically processes them to extract meaningful information. Through sophisticated AI algorithms, the platform classifies documents, generates semantic embeddings for intelligent search, and provides an interactive question-answering interface that understands document context.

The platform addresses multiple use cases across different domains. For job seekers, it serves as an intelligent career assistant that can analyze resumes, suggest relevant job opportunities, and prepare users for interviews through mock question-answering sessions. For medical professionals, it can process medical records and provide quick references to patient information. Financial analysts benefit from automated analysis of financial statements and reports. Educational institutions can integrate course materials for intelligent tutoring.

### 1.1.2 Core Technologies

The technical foundation of this project rests on a carefully selected stack of modern technologies that work together to deliver powerful capabilities.

**Frontend Technologies:**

- **React.js v18**: A progressive JavaScript library for building user interfaces. React's component-based architecture enables reusable UI elements and efficient state management. Its virtual DOM ensures optimal rendering performance even with complex document interfaces.

- **Vite**: A next-generation build tool that provides extremely fast development server startup and hot module replacement. Vite transforms modern JavaScript code during development, eliminating the wait time associated with traditional bundlers.

- **Tailwind CSS**: A utility-first CSS framework that enables rapid UI development through pre-defined utility classes. Tailwind's constraint-based design approach ensures consistent styling across the application while allowing complete customization.

- **Axios**: A promise-based HTTP client for making API requests. Axios provides better error handling and automatic transformation of JSON data compared to the native fetch API.

**Backend Technologies:**

- **Node.js v20**: A JavaScript runtime built on Chrome's V8 engine. Node.js enables server-side JavaScript execution, allowing developers to use a unified language stack across frontend and backend.

- **Express.js**: A minimal and flexible Node.js web application framework. Express provides robust routing, middleware support, and template engines for building RESTful APIs and web applications.

- **MongoDB**: A NoSQL database that uses JSON-like documents with dynamic schemas. MongoDB's document-oriented nature makes it ideal for storing user data, chat sessions, and flexible data structures.

- **ChromaDB**: An open-source vector database designed for similarity search and AI applications. ChromaDB stores document embeddings and enables efficient semantic search through approximate nearest neighbor algorithms.

**AI and Machine Learning:**

- **Groq LLM (Llama-3.1-8b-instant)**: A large language model that provides natural language generation capabilities. Groq's specialized inference hardware delivers extremely low latency responses, making it ideal for interactive applications.

- **Hugging Face Transformers (all-MiniLM-L6-v2)**: A state-of-the-art sentence embedding model that converts text into 384-dimensional vectors. This model provides excellent semantic understanding while remaining computationally efficient.

**Python RAG Microservice (FastAPI):**

- **FastAPI + Uvicorn**: A lightweight Python microservice implements a LangChain-style RAG pipeline (chunk → embed → store → retrieve → generate). The service is containerized and runs alongside the Node backend and ChromaDB.

- **Service endpoints:**
  - `POST /ingest` — Accepts form-data: `text` (string) or `file` (PDF/TXT upload) and optional `collection_name`. Chunks text, creates embeddings, and adds documents to a ChromaDB collection.
  - `POST /qa` — Accepts form-data: `question` (string), optional `collection_name` and `top_k`. Embeds the question, retrieves top-K documents from Chroma, constructs a prompt, and calls the configured LLM to produce an answer. Returns `{ answer, sources }`.
  - `GET /health` — Lightweight health check returning service status.

- **Vector store:** Uses ChromaDB (HTTP REST client) to store 384D embeddings and metadata. Default host/port are `chromadb:8000` inside the Compose network.

- **Model & client compatibility:** The microservice supports either an OpenAI-compatible API key (`OPENAI_API_KEY`) or a Groq key (`GROQ_API_KEY`) via environment variables. The implementation attempts to use the modern `openai.OpenAI()` client (openai-python v1.0+/v2 interface) when available and falls back to legacy calls where necessary. If you see the message about `openai.Embedding` being unsupported, your installed OpenAI Python package is v1.0+ and the code uses the modern client — ensure an API key is set.

- **Configuration (example env variables):** `OPENAI_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_BASE`, `GROQ_API_BASE`, `CHROMA_HOST`, `CHROMA_PORT`, `COLLECTION_NAME`, `EMBEDDING_MODEL`, `CHAT_MODEL`.

- **Docker / Compose:** The service runs in Compose as `langchain-rag` and exposes port `8001` (container). Compose uses an env file at `python-rag/.env` for configuration.

- **Quick run & restart commands:** After adding your API key to `python-rag/.env`, restart the service to pick up env changes:

```bash
# from the project root
docker compose up --build --detach langchain-rag
# or after editing .env
docker compose restart langchain-rag
```

- **Testing tips (PowerShell):** When testing with `curl` on Windows PowerShell be careful with quoting. Use `curl.exe` (the native curl binary) or PowerShell's `Invoke-RestMethod` with `ConvertTo-Json` to avoid malformed JSON. Example multipart upload (bash):

```bash
curl -X POST http://localhost:5000/api/langchain/ingest \
  -F "file=@/path/to/doc.pdf" \
  -F "collection_name=test_docs"
```

```powershell
$body = @{ text = 'Short test doc'; collection_name = 'test_docs' } | ConvertTo-Json
curl.exe -X POST http://localhost:5000/api/langchain/ingest -H "Content-Type: application/json" -d $body
```

Note: The Node backend provides proxy endpoints at `/api/langchain/*` which forward requests to the Python RAG microservice; use the backend's `/api/langchain/ingest` and `/api/langchain/qa` to test end-to-end through the app.

**OCR and Document Processing:**

- **Tesseract.js**: A pure JavaScript OCR library that converts images to text. Tesseract.js runs entirely in the browser or Node.js environment, supporting multiple languages and providing reliable text recognition.

- **pdf-parse**: A Node.js library for extracting text content from PDF files. This library preserves document structure and formatting information during extraction.

### 1.1.3 System Capabilities

The platform delivers comprehensive document processing and AI-powered features across multiple domains:

**Document Upload and Processing:**

- Support for PDF files and image formats (PNG, JPG, JPEG)
- Automatic text extraction using OCR
- Intelligent document classification into six categories
- Text chunking and embedding generation
- Storage in vector database for semantic search

**Intelligent Question Answering:**

- RAG-based question answering using document context
- Semantic search for relevant information
- Source attribution with citation
- General knowledge fallback for out-of-scope questions
- Category-specific responses

**Dynamic Question Generation:**

- LLM-powered question generation based on document content
- Queries to vector database for similar stored documents
- Category-aware question templates
- Fallback static questions when LLM fails

**Job Search and Matching:**

- Skill extraction from documents using keyword analysis
- Integration with Jooble job search API
- Location-based job filtering
- Relevance scoring and ranking

**Resume Comparison and Evaluation:**

- Side-by-side resume and job description comparison
- Match percentage calculation
- Gap analysis and improvement suggestions
- Skill alignment scoring

---

## 1.2 Literature Review

### 1.2.1 Background and Context

The development of intelligent document processing systems has evolved significantly over the past decade. Traditional approaches to document handling required extensive manual intervention, limiting scalability and introducing human error. Modern AI-powered solutions have transformed these workflows, but significant challenges remain.

### 1.2.2 Traditional Document Processing

Early document processing systems relied on template-based parsing and rule-based extraction methods. These systems required predefined templates for each document type, making them inflexible and maintenance-intensive. Key limitations included:

- **Template Dependency**: Systems could only process documents that matched predefined templates. Any variation in format required template updates.

- **Limited Recognition**: Rule-based OCR systems struggled with handwritten text, varied fonts, and complex layouts.

- **No Semantic Understanding**: Keyword matching provided no understanding of document meaning or context.

- **Manual Verification**: Human intervention was required to verify extracted information accuracy.

Academic research on document processing during the 1990s and 2000s focused on improving OCR accuracy and template matching algorithms. However, these approaches remained fundamentally limited to pattern recognition without true understanding.

### 1.2.3 Conventional Search Systems

Search systems evolved from simple keyword matching to more sophisticated approaches:

- **Boolean Search**: Logical operators (AND, OR, NOT) enabled basic query refinement but required expert knowledge to use effectively.

- **TF-IDF Ranking**: Term frequency-inverse document frequency algorithms provided relevance scoring but captured no semantic relationships.

- **Latent Semantic Analysis**: Early semantic approaches used statistical co-occurrence patterns but lacked deep language understanding.

These systems suffered from the "vocabulary mismatch" problem: users and document authors used different terminology, leading to missed relevant results.

### 1.2.4 Basic Question Answering Systems

Early QA systems relied on:

- **Rule-Based Responses**: Predefined response templates triggered by specific keywords or patterns.

- **Information Retrieval**: Document retrieval without true question understanding or generation.

- **Fragment Assembly**: Pre-written responses assembled based on matched information.

These systems produced rigid, unhelpful responses that failed to understand user intent or provide genuine assistance.

### 1.2.5 Research Gap Analysis

Despite advances in document processing, search, and QA systems, significant gaps remained:

**Gap 1: Unified Processing Pipeline**

Previous systems treated document upload, storage, search, and问答 as separate components. No unified pipeline existed that seamlessly connected document ingestion to intelligent questioning.

**Gap 2: Static Question Generation**

Question suggestion systems generated generic, template-based questions unrelated to actual document content. Users received unhelpful suggestions that didn't reflect their documents.

**Gap 3: Manual Job Matching**

Job matching required manual keyword searching and comparison. No intelligent system connected resume content to relevant job opportunities automatically.

**Gap 4: Limited Context Awareness**

QA systems lacked true understanding of document context. Responses either referenced document content poorly or ignored it entirely.

**Gap 5: No Source Attribution**

Users received answers without knowing the source of information. Trust and verification were impossible.

### 1.2.6 The RAG Approach

Retrieval-Augmented Generation (RAG) addresses these gaps by combining:

- **Semantic Search**: Vector embeddings capture meaning beyond keywords
- **Contextual Retrieval**: Documents are retrieved based on relevance, not exact matches
- **Augmented Generation**: LLM receives retrieved context with questions
- **Source Tracking**: Citations provide verification

RAG systems represent the state-of-the-art in document-based AI applications. This project implements a complete RAG pipeline with additional features for job matching and comparison.

---

## 1.3 Objectives

### 1.3.1 Primary Objectives

The project aims to achieve the following primary objectives:

**Objective 1: Document Upload and Processing**

- Create a robust document upload system supporting multiple file formats
- Implement reliable text extraction using OCR techniques
- Develop automatic document classification into domain categories
- Generate embeddings for semantic search
- Store processed content in vector database

**Objective 2: Intelligent Question Answering**

- Build RAG pipeline for document-aware question answering
- Implement semantic search using vector embeddings
- Integrate LLM for natural language response generation
- Provide source attribution with answers
- Handle out-of-scope questions gracefully

**Objective 3: Dynamic Question Generation**

- Generate questions specific to uploaded document content
- Query vector database for similar stored documents
- Use LLM to create relevant questions
- Provide fallback static questions when needed
- Support multiple document categories

**Objective 4: Job Search and Matching**

- Extract skills from documents automatically
- Integrate external job search APIs
- Match candidate profiles to job openings
- Provide location-based filtering

**Objective 5: Resume Comparison and Evaluation**

- Compare resume content to job descriptions
- Calculate match percentage scores
- Identify skill gaps and improvements
- Generate actionable feedback

### 1.3.2 Secondary Objectives

**Objective 6: User Authentication**

- Implement user registration and login
- Support role-based access control
- Provide secure password handling
- Include email verification

**Objective 7: Chat Sharing**

- Enable sharing conversations via unique links
- Store shareable chat sessions
- Provide access controls for shared content

**Objective 8: Comparison Mode**

- Side-by-side comparison interface
- Visual gap analysis
- Skill alignment visualization

---

## 1.4 Significance

### 1.4.1 Technical Significance

This project demonstrates production-level implementation of:

- **Complete RAG Pipeline**: End-to-end document processing from upload to answer
- **Multi-Modal Input**: Support for diverse document formats
- **Vector Database Integration**: ChromaDB for semantic search
- **LLM Integration**: Groq for natural language generation
- **Docker Containerization**: Production deployment capabilities

### 1.4.2 Practical Significance

The platform provides practical benefits:

**For Job Seekers:**

- Automated resume analysis and optimization
- Relevant job matching
- Interview preparation through mock Q&A
- Skill gap identification

**For Recruiters:**

- Automated candidate screening
- Resume-job matching
- Skill assessment

**For Organizations:**

- Document processing automation
- Knowledge management
- Quick information retrieval

### 1.4.3 Educational Value

The project serves as a comprehensive learning example:

- Full-stack development patterns
- AI/ML integration in production
- Modern architecture patterns (microservices-ready)
- Docker containerization
- API design best practices

---

## 1.5 Research Design

### 1.5.1 System Architecture

The system follows a three-tier architecture:

```
┌──────────────────────────────────────────��──────────────────────────────┐
│                          CLIENT LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                         React Application                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │ │
│  │  │  Dashboard   │  │  Upload     │  │  Chat        │          │ │
│  │  │  Page        │  │  Page       │  │  Interface  │          │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │ │
│  │  │    Jobs      │  │   Compare    │  │    Share    │          │ │
│  │  │    Mode     │  │    Mode      │  │    Modal   │          │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                           HTTP/REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SERVER LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                       Express.js Server                          │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │                    Controllers                            │  │ │
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │  │ │
│  │  │  │ uploadController    │ queryController     │ jobsController    │      │  │ │
│  │  │  │                  │                   │               │      │  │ │
│  │  │  │ suggestedQuestions  │ compareController │ shareController  │      │  │ │
│  │  │  │ Controller    │             │                 │               │      │  │ │
│  │  │  └──────────────┘ └──────────────┘ └──────────────┘      │  │ │
│  │  │                                                          │  │ │
│  │  │                    Services                             │  │ │
│  │  │  ┌──────────────┐ ┌─────────────��┐ ���──────────────┐      │  │ │
│  │  │  │  ocrService  │ │ embeddingService│ vectorService│      │  │ │
│  │  │  │             │ │                │               │      │  │ │
│  │  │  │ ragService  │ │ classification │ compareService│      │  │ │
│  │  │  │             │ │    Service    │               │      │  │ │
│  │  │  └──────────────┘ └──────────────┘ └──────────────┘      │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                           External Services
          ┌────────────────────────┬┴────────────────────────┐
          ▼                        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│     MongoDB      │    │     ChromaDB      │    │      Groq        │
│    (Users)      │    │   (Vectors)      │    │      (LLM)       │
│                 │    │                  │    │                  │
│ User data &     │    │ Document        │    │ LLaMA-3.1-8B     │
│ authentication │    │ embeddings      │    │ Instant         │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### 1.5.2 Data Flow Architecture

**Document Upload Flow:**

```
User Uploads Document (PDF/Image)
         │
         ▼
┌───────────────────────┐
│  Express Middleware   │
│  (multer)             │
│  - File validation    │
│  - Size checking     │
│  - Type filtering    │
└───────────────────────┘
         │
         ▼
┌───────────────────────┐
│    OCR Service        │
│    - pdf-parse        │
│    - Tesseract.js     │
│  Extract text from:  │
│  - PDF files         │
│  - Image files       │
└───────────────────────┘
         │
         ▼
┌───────────────────────┐
│  Classification     │
│    Service            │
│  Keyword matching:   │
│  - Resume            │
│  - Medical           │
│  - Financial         │
│  - Educational       │
│  - Legal             │
│  - General           │
└───────────────────────┘
         │
         ▼
┌───────────────────────┐
│    Chunk Service     │
│  Split text into:     │
│  - 500-token chunks  │
│  - 100-token overlap │
└───────────────────────┘
         │
         ▼
┌───────────────���─���─────┐
│  Embedding Service    │
│    (Hugging Face)     │
│  all-MiniLM-L6-v2:   │
│  - 384 dimensions   │
│  - Mean pooling     │
│  - Normalized      │
└───────────────────────┘
         │
         ▼
┌───────────────────────┐
│   Vector Service     │
│    (ChromaDB)        │
│  Store in:           │
│  - Collection: docs │
│  - Metadata: source │
└───────────────────────┘
         ▼
   Document Ready for Search
```

**Question Answering Flow:**

```
User Submits Question
         │
         ▼
┌───────────────────────┐
│  Embedding Service   │
│    (Hugging Face)    │
│  Generate query:    │
│  embedding vector  │
└───────────────────────┘
         │
         ▼
┌───────────────────────┐
│   Vector Service     │
│    (ChromaDB)        │
│  Semantic search:   │
│  - Top-K = 5        │
│  - Cosine distance │
└───────────────────────┘
         │
         ├──────────────────────┐
         │                      │
    ┌────┴─────┐          ┌──────┴──────┐
    │ Results  │          │ No Results  │
    │ Found   │          │  Found     │
    └────┬─────┘          └──────┬──────┘
         │                      │
         ▼                      ▼
┌─────────────────────────────────┐
│       Groq LLM (LLaMA)          │
│  System Prompt:                  │
│  "You are a helpful document     │
│   assistant with access to      │
│   both document and            │
│   general knowledge..."        │
│                                 │
│  User Prompt:                   │
│  "Document content: [chunks]   │
│   Question: [user question]    │
│   Provide helpful answer..."   │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│      Format Response            │
│  - Bullet points              │
│  - Numbered lists             │
│  - Bold key terms            │
│  - Source citations          │
└─────────────────────────────────┘
         ▼
    AI Response to User
```

---

## 1.6 Source of Data

### 1.6.1 Primary Data Sources

**User-Uploaded Documents:**

The primary data source consists of user-uploaded documents in various formats:

- **PDF Files**: Portable Document Format files containing text-based or image-based content. PDF files preserve formatting across platforms and are the standard for professional documents.

- **Image Files**: PNG, JPG, JPEG, and other common image formats containing scanned documents or photographs. Tesseract.js performs OCR on these files.

**Document Content:**

Once uploaded, documents provide:

- Extracted text content
- Document category metadata
- Chunked segments for embedding
- Source filename for reference

### 1.6.2 External APIs

**Groq API:**

- **Endpoint**: https://api.groq.com/openai/v1
- **Model**: llama-3.1-8b-instant
- **Purpose**: Natural language generation
- **Usage**: Question answering, question generation, comparison

**Jooble Job API:**

- **Endpoint**: https://jooble.org/api/{apiKey}
- **Purpose**: Job search functionality
- **Usage**: Job listings based on skills/location

**ChromaDB:**

- **Endpoint**: http://chromadb:8000
- **Purpose**: Vector storage and search
- **Usage**: Document embedding storage, semantic search

### 1.6.3 System-Generated Data

**Embeddings:**

The system generates 384-dimensional vector embeddings for:

- Document chunks
- User questions
- Job descriptions

**Classifications:**

Rule-based classification assigns categories:

- Resume/CV
- Medical documents
- Financial documents
- Educational materials
- Legal documents
- General

**Extracted Skills:**

Keyword matching extracts skills from documents:

- Technical skills
- Domain-specific terminology
- Certifications
- Experience levels

---

## 1.7 Chapter Scheme

### 1.7.1 Documentation Structure

This documentation follows a standard technical project report structure:

| Chapter | Title                       | Content Overview                                       |
| ------- | --------------------------- | ------------------------------------------------------ |
| 1       | Introduction                | Project background, objectives, significance           |
| 2       | Requirement Analysis        | System specifications, feasibility, design constraints |
| 3       | System Design               | Architecture, modules, database design                 |
| 4       | Implementation              | Technologies, coding standards, testing                |
| 5       | Results and Discussion      | API responses, performance, limitations                |
| 6       | Conclusion and Future Scope | Summary, achievements, future work                     |

### 1.7.2 Chapter Dependencies

```
Chapter 1: Introduction
    │
    ▼
Chapter 2: Requirement Analysis
    │  ← Uses project overview from Ch 1
    ▼
Chapter 3: System Design
    │  ← Uses requirements from Ch 2
    ▼
Chapter 4: Implementation
    │  ← Uses design specifications from Ch 3
    ▼
Chapter 5: Results
    │  ← Uses implementation from Ch 4
    ▼
Chapter 6: Conclusion
    │  ← Uses results from Ch 5
    ▼
    End
```

---

# Chapter 2: REQUIREMENT ANALYSIS AND SYSTEM SPECIFICATION

## 2.1 Problem Statement

### 2.1.1 Identified Problems

The modern workplace faces significant challenges in document handling and career preparation. This project addresses several critical problems that affect job seekers and professionals across industries.

**Problem 1: Manual Document Processing**

Job seekers spend countless hours manually processing their resumes and other documents. They must manually extract information, format content for different applications, and maintain multiple versions. Medical professionals face similar challenges with patient records. Financial analysts manually process reports and statements.

**Problem 2: Static Question Systems**

Existing question-generation systems produce generic, templated questions that don't reflect actual document content. When users upload a resume about Java development, they receive questions about medical procedures. This disconnect makes preparation ineffective.

**Problem 3: Inefficient Job Search**

Job searching requires manual keyword research, multiple site searches, and manual matching. Job seekers must identify relevant positions through trial and error, missing opportunities they qualify for.

**Problem 4: Limited Semantic Search**

Traditional search systems rely on keyword matching, missing documents that use different terminology. A search for "JavaScript" misses documents mentioning "JS". Semantic understanding would recognize these as related.

**Problem 5: No Contextual Answers**

Question-answering systems either ignore document context or provide superficial references. Users can't verify answers or explore source materials.

### 2.1.2 Proposed Solution

The RAG Document Scanner & AI Interview Platform addresses these problems through:

1. **Automated Document Processing**: Upload once, process automatically. Classification, embedding, and storage happen seamlessly.

2. **Dynamic Questions**: Generate questions specific to uploaded content using document text and similar stored documents.

3. **Intelligent Job Matching**: Extract skills from documents and match to relevant listings automatically.

4. **Semantic Search**: Use vector embeddings to find conceptually similar content regardless of terminology.

5. **Source Attribution**: Provide citations with every answer for verification.

---

## 2.2 Existing System

### 2.2.1 Current Approaches

**Traditional Resume Portals:**

Major job portals (LinkedIn, Indeed, Monster) offer:

- Profile creation and hosting
- Job search with filters
- Application tracking
- Basic resume matching

Limitations:

- Keyword-based matching, no semantic understanding
- Generic interview questions
- No document-specific preparation
- No intelligent Q&A

**Document Management Systems:**

Enterprise systems offer:

- Document storage and retrieval
- Version control
- Access management

Limitations:

- No AI capabilities
- No question answering
- No job matching

**Mock Interview Platforms:**

Simulation platforms offer:

- Recorded question banks
- Timer-based practice
- Self-assessment

Limitations:

- Static questions
- No document integration
- No intelligent feedback

### 2.2.2 Comparison Table

| Feature         | Traditional       | Our System         |
| --------------- | ----------------- | ------------------ |
| Document Input  | Manual data entry | Automatic OCR      |
| Questions       | Static templates  | Dynamic generation |
| Job Search      | Manual filtering  | Automatic matching |
| Search Type     | Keyword           | Semantic           |
| Answers         | Generic           | Document-aware     |
| Source Citation | No                | Yes                |

---

## 2.3 Proposed System

### 2.3.1 Core Features

**Feature 1: Multi-Format Document Upload**

- Accept PDF and image files
- Validate file types and sizes
- Handle upload errors gracefully
- Provide progress feedback

**Feature 2: Automatic Text Extraction**

- Extract text from PDFs using pdf-parse
- Perform OCR on images using Tesseract.js
- Handle extraction errors
- Preserve text structure

**Feature 3: Intelligent Classification**

- Classify into 6 categories
- Use keyword matching for confidence
- Handle ambiguous documents
- Store category metadata

**Feature 4: Semantic Search**

- Generate embeddings using Hugging Face
- Store in ChromaDB vector database
- Retrieve top-K results
- Calculate relevance distances

**Feature 5: RAG Question Answering**

- Build context from retrieved documents
- Generate responses using Groq LLM
- Provide source citations
- Fall back to general knowledge

**Feature 6: Dynamic Questions**

- Use LLM for question generation
- Query stored documents
- Generate content-specific questions
- Provide category-aware templates

**Feature 7: Job Search Integration**

- Extract skills from documents
- Query Jooble API
- Format job listings
- Filter by location

**Feature 8: Resume Comparison**

- Score resume-job match
- Identify gaps
- Provide suggestions

### 2.3.2 System Features Summary

The platform combines all these features into a unified experience. Users upload a document once and gain access to complete document analysis, intelligent Q&A, job matching, and comparison tools.

---

## 2.4 Feasibility Study

### 2.4.1 Technical Feasibility

**Assessment: FEASIBLE**

All required technologies are available and mature:

- **React.js**: Stable, widely used, excellent documentation
- **Express.js**: Mature framework with extensive ecosystem
- **MongoDB**: Well-established NoSQL database
- **ChromaDB**: Production-ready vector database
- **Groq API**: Reliable LLM service with free tier
- **Hugging Face**: Industry-standard embeddings

**Risk Mitigation:**

- API keys required (managed through environment variables)
- Docker ensures consistent deployment
- Error handling prevents crashes

### 2.4.2 Economic Feasibility

**Assessment: FEASIBLE**

All components have free tiers or are open source:

- **Groq**: Free tier available
- **ChromaDB**: Open source
- **MongoDB**: Free community edition
- **Hugging Face**: Free model inference
- **Tesseract.js**: Open source
- **Total Cost**: $0 for development and deployment using Docker

### 2.4.3 Operational Feasibility

**Assessment: FEASIBLE**

The system requires minimal operational overhead:

- Users interact through intuitive web interface
- Processing happens automatically
- No manual intervention required
- Docker Compose manages all services

### 2.4.4 Feasibility Summary

| Category    | Status      | Notes                       |
| ----------- | ----------- | --------------------------- |
| Technical   | ✅ Feasible | All technologies available  |
| Economic    | ✅ Feasible | Free tiers available        |
| Operational | ✅ Feasible | Minimal oversight needed    |
| Schedule    | ✅ Feasible | 8-week development timeline |

---

## 2.5 Software Requirement Specification

### 2.5.1 Data Requirement

**Data Storage Requirements:**

| Data Type           | Storage System        | Purpose                |
| ------------------- | --------------------- | ---------------------- |
| User credentials    | MongoDB               | Authentication, roles  |
| Session metadata    | In-memory             | Current document state |
| Document embeddings | ChromaDB              | Semantic search        |
| Chat sessions       | In-memory             | Temporary storage      |
| API keys            | Environment variables | Service authentication |

**Data Volume:**

- Maximum file size: 50MB
- Embedding dimensions: 384
- Chunk size: 500 tokens
- Concurrent users: ~50 (development)

### 2.5.2 Functional Requirement

**Core Functionality:**

| ID  | Function            | Input                | Output               | Priority |
| --- | ------------------- | -------------------- | -------------------- | -------- |
| F01 | Upload Document     | Multipart file       | Processing status    | Critical |
| F02 | Extract Text        | File path, MIME type | Extracted text       | Critical |
| F03 | Classify Document   | Text                 | Category, confidence | High     |
| F04 | Chunk Text          | Text                 | Text chunks array    | Critical |
| F05 | Generate Embeddings | Text chunks          | 384D vectors         | Critical |
| F06 | Store Vectors       | Embeddings, metadata | Success status       | Critical |
| F07 | Search Similar      | Query vector         | Top-K documents      | Critical |
| F08 | Ask Question        | Question text        | Answer, sources      | Critical |
| F09 | Get Suggestions     | Category, text       | Question array       | High     |
| F10 | Search Jobs         | Keywords, location   | Job array            | Medium   |
| F11 | Compare Resume      | Resume, JD           | Match score          | Medium   |
| F12 | Share Chat          | Chat data            | Share link           | Low      |

**API Routes:**

| Route                    | Method | Description       |
| ------------------------ | ------ | ----------------- |
| /api/upload              | POST   | Upload document   |
| /api/ask                 | POST   | Ask question      |
| /api/suggested-questions | GET    | Get suggestions   |
| /api/jobs                | POST   | Search jobs       |
| /api/compare             | POST   | Compare resume    |
| /api/share               | POST   | Create share link |

### 2.5.3 Performance Requirement

| Metric               | Target       | Acceptance Criteria |
| -------------------- | ------------ | ------------------- |
| Document upload      | < 30 seconds | PDF under 10 pages  |
| Text extraction      | < 15 seconds | For PDFs            |
| OCR processing       | < 20 seconds | For images          |
| Embedding generation | < 10 seconds | Per chunk           |
| Question response    | < 5 seconds  | Within SLA          |
| Job search           | < 10 seconds | API dependent       |

### 2.5.4 Dependability Requirement

- **Uptime**: 99.9% availability
- **Error Recovery**: Automatic retry with exponential backoff
- **Graceful Degradation**: Fallback to general knowledge when no document match
- **Clear Errors**: Meaningful error messages in responses

### 2.5.5 Maintainability Requirement

- **Modular Design**: Separate controllers and services
- **Single Responsibility**: Each function does one thing
- **JSON APIs**: Consistent response format
- **Logging**: Comprehensive console logging

### 2.5.6 Security Requirement

- **File Validation**: Type and size checking
- **Input Sanitization**: Escape special characters
- **API Key Protection**: Environment variables only
- **No Credentials in Code**: Environment-based configuration

### 2.5.7 Look and Feel Requirement

- **Professional UI**: Clean, modern design
- **Responsive**: Works on desktop and mobile
- **Visual Hierarchy**: Clear information architecture
- **Loading States**: Feedback during processing

---

## 2.6 Validation

### 2.6.1 Input Validation

All API endpoints validate input:

- **File Upload**: Type (PDF/image) and size (< 50MB)
- **Question**: Non-empty string under 1000 characters
- **Category**: Valid enum value
- **Keywords**: Non-empty string

### 2.6.2 Response Validation

- **Success Responses**: Include required fields
- **Error Responses**: Include error message and optional details
- **Status Codes**: 200 for success, 400 for client errors, 500 for server errors

---

## 2.7 Expected Hurdles

### 2.7.1 RAG Challenges

**Challenge 1: Context Window Limitations**

LLMs have maximum context lengths (typically 8K-128K tokens). Large documents exceed these limits.

**Solution**: Chunk documents into smaller segments (500 tokens). Retrieve only relevant chunks.

**Challenge 2: Embedding Quality**

Embeddings may not capture all semantic meaning. Some concepts get lost.

**Solution**: Use state-of-the-art models (all-MiniLM-L6-v2). Apply mean pooling and normalization.

**Challenge 3: Chunk Size optimization**

Too-large chunks dilute relevance. Too-small chunks lack context.

**Solution**: Use 500-token chunks with 100-token overlap for continuity.

### 2.7.2 Memory Challenges

**Challenge 1: Document State**

Documents are stored in-memory only. No persistence across restarts.

**Solution**: Single-session use case acceptable for MVP. Future versions can add persistence.

**Challenge 2: Singleton Pattern**

Only one document can be active at a time.

**Solution**: Clear collection before adding new document.

### 2.7.3 Deployment Challenges

**Challenge 1: Docker Networking**

Services need to communicate across containers.

**Solution**: Docker Compose defines shared network.

**Challenge 2: API Keys**

External API keys must be managed securely.

**Solution**: Environment variables, not committed to version control.

**Challenge 3: Resource Limits**

Container memory and CPU constraints.

**Solution**: Resource limits in docker-compose.yml.

---

## 2.8 SDLC Model Used

### 2.8.1 Agile Iterative Model

The project follows Agile methodology with iterative development:

```
Week 1: Project Setup
- Repository creation
- Docker configuration
- Basic structure

Week 2: Backend Core
- Server setup
- Database connection
- Basic routes

Week 3: Document Processing
- Upload endpoint
- OCR service
- Classification service

Week 4: RAG Pipeline
- Embedding service
- Vector service
- RAG service

Week 5: Frontend
- React setup
- Dashboard
- Upload interface

Week 6: Features
- Chat interface
- Jobs mode
- Compare mode

Week 7: Testing
- Integration testing
- Bug fixes
- Polish

Week 8: Documentation
- README
- Project report
- Final submission
```

### 2.8.2 Phase Deliverables

| Phase         | Deliverable           |
| ------------- | --------------------- |
| Planning      | Requirements document |
| Design        | Architecture diagrams |
| Development   | Working code          |
| Testing       | Test results          |
| Deployment    | Running application   |
| Documentation | Technical report      |

---

# Chapter 3: SYSTEM DESIGN

## 3.1 Design Approach

### 3.1.1 Design Principles

The system follows proven software engineering principles:

**Separation of Concerns:**

Each layer handles distinct responsibilities:

- **Controller Layer**: HTTP request handling, validation, response formatting
- **Service Layer**: Business logic, data transformations
- **Data Layer**: Storage operations, external API calls

**Single Responsibility:**

Each function performs one specific task:

- `extractTextFromFile()` - Text extraction only
- `chunkText()` - Text splitting only
- `generateEmbedding()` - Vector generation only

**Interface-Based Communication:**

Services communicate through well-defined interfaces:

```
// Service exports
export async function askQuestion(question) {
  // Implementation
}

export async function searchSimilar(embedding, topK) {
  // Implementation
}
```

**Error-First Design:**

Every async function includes error handling:

```javascript
try {
  // Operation
} catch (error) {
  console.error("Operation failed:", error);
  throw error;
}
```

### 3.1.2 Architecture Patterns

**Module Pattern:**

Related functionality grouped in modules:

```
/services
  /ragService.js      # RAG implementation
  /vectorService.js  # ChromaDB operations
  /embeddingService.js # Hugging Face
```

**Middleware Pattern:**

Express middleware for cross-cutting concerns:

- File upload handling (multer)
- JSON parsing (express.json)
- CORS (cors package)

**Route-Controller Pattern:**

Routes delegate to controller functions:

```javascript
router.post("/ask", queryController.askQuestion);
```

---

## 3.2 Overall System Architecture

### 3.2.1 High-Level Architecture

The system consists of four main components:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATION                                  │
│   (React.js + Vite + Tailwind CSS)                                       │
│                                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│   │  Upload   │  │    Chat    │  │    Jobs    │  │  Compare   │     │
│   │   Page    │  │ Interface  │  │    Mode    │  │    Mode    │     │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                              HTTP/REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SERVER APPLICATION                               │
│                    (Express.js + Node.js)                          │
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────┐       │
│   │                    CONTROLLERS                             │       │
│   │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │       │
│   │  │   Upload  │ │   Query   │ │   Jobs    │ │  Compare  │   │       │
│   │  │Controller│ │Controller│ │Controller│ │Controller│   │       │
│   │  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │       │
│   └───────────────���─���─────────────────────────────────────────────┘       │
│                                    │                                 │
│   ┌───────────────────────────────────────────────────────────────┐       │
│   │                     SERVICES                               │       │
│   │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │       │
│   │  │   OCR     │ │  Embedding │ │   Vector  │            │       │
│   │  │  Service  │ │  Service   │ │  Service  │            │       │
│   │  └────────────┘ └────────────┘ └────────────┘            │       │
│   │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │       │
│   │  │   RAG    │ │ Classify  │ │  Compare │            │       │
│   │  │  Service  │ │  Service │ │  Service │            │       │
│   │  └────────────┘ └────────────┘ └────────────┘            │       │
│   └───────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                       ▼                       ▼
   ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
   │   MongoDB   │        │   ChromaDB  │        │    Groq    │
   │             │        │             │        │            │
   │  User data │        │  Embeddings │        │    LLM     │
   │ & sessions │        │  & search   │        │  (LLaMA)   │
   └──────────────┘        └──────────────┘        └──────────────┘
```

### 3.2.2 Component Interaction

**Client-Server Communication:**

1. Client sends HTTP request
2. Express server receives request
3. Route matches controller
4. Controller invokes service
5. Service processes data
6. Response returns to client

**Service Dependency Chain:**

```
User Request
    │
    ▼
Controller ──▶ Service 1 ──▶ Service 2 ──▶ External API
    │              │               │
    │              │               └─▶ ChromaDB (vectors)
    │              │
    │              └─▶ Groq (LLM)
    │
    ▼
Response
```

---

## 3.3 Module-Wise Design

### 3.3.1 Module 1: Resume Analyzer

**Purpose**: Process uploaded documents and prepare them for semantic search

**Module Components**:

```
┌─────────────────────────────────────────────────────────────────┐
│                MODULE 1: RESUME ANALYZER                         │
├───��─��───────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │    File    │───▶│    OCR     │───▶│ Chunking   │          │
│  │   Upload   │    │  Service   │    │  Service   │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│         │                  │               │                        │
│         ▼                ▼               ▼                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │  Multer   │    │  pdf-parse│    │   Split   │          │
│  │middleware│    │tesseract │    │   into    │          │
│  │         │    │   .js    │    │chunks    │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                                         │                       │
│                                         ▼                       │
│                               ┌─────────────┐                   │
│                               │ Embedding  │                   │
│                               │  Service  │                   │
│                               └─────────────┘                   │
│                                      │                          │
│                                      ▼                          │
│                               ┌─────────────┐                   │
│                               │  Classification│              │
│                               │  Service   │                   │
│                               └─────────────┘                   │
│                                      │                          │
│                                      ▼                          │
│                               ┌─────────────┐                   │
│                               │  Vector   │                     │
│                               │  Service  │                   │
│                               └─────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Detailed Flow**:

```
Step 1: File Upload (uploadController.uploadDocument)
────────────────────────────────────────────
User uploads PDF/image → Express receives via multer → Validates file type and size

Step 2: Text Extraction (ocrService.extractTextFromFile)
─────────────────────────────────────────────────
IF PDF:
  - Read file buffer
  - Extract using pdf-parse
  - Return text string

IF Image:
  - Use Tesseract.js
  - Recognize text
  - Return text string

Step 3: Text Chunking (chunkService.chunkText)
───────────────────────────────────────────
- Split text by sentences
- Group into 500-token chunks
- Apply 100-token overlap
- Return chunk array

Step 4: Generate Embeddings (embeddingService.generateEmbeddings)
──────────────────────────────────────────────────────────
- Load Xenova/all-MiniLM-L6-v2
- Process each chunk through pipeline
- Apply mean pooling
- Normalize vectors
- Return embedding array

Step 5: Classification (classificationService.classifyDocument)
─────────────────────────────────────────────────────
- Check keywords for each category
- Calculate confidence scores
- Assign category
- Return category object

Step 6: Store in Vector Database (vectorService.addDocuments)
────────────────────────────────────────────────────
- Initialize ChromaDB collection
- Add embeddings with metadata
- Store chunks and source
```

**Key Functions**:

| Function                | Input                  | Output            | Responsibility    |
| ----------------------- | ---------------------- | ----------------- | ----------------- |
| `uploadDocument()`      | Request file           | Processing result | Main controller   |
| `extractTextFromFile()` | File path, MIME        | Extracted text    | Text extraction   |
| `chunkText()`           | Full text              | Text chunks       | Text splitting    |
| `generateEmbeddings()`  | Text chunks            | 384D vectors      | Create embeddings |
| `classifyDocument()`    | Text                   | Category          | Document type     |
| `addDocuments()`        | Chunks with embeddings | Status            | Storage           |

### 3.3.2 Module 2: Mock Interview (RAG)

**Purpose**: Enable intelligent question-answering about document content

**Module Components**:

```
┌─────────────────────────────────────────────────────────────────┐
│            MODULE 2: MOCK INTERVIEW (RAG)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Question  │───▶│  Embedding │───▶│  Vector     │        │
│  │   Input    │    │  Query    │    │  Search    │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                                            │                  │
│                                            ▼                  │
│                                 ┌─────────────────┐          │
│                                 │  Context       │          │
│                                 │  Building     │          │
│                                 └─────────────────┘          │
│                                            │                  │
│                                            ▼                  │
│                                 ┌─────────────────┐          │
│                                 │     Groq       │          │
│                                 │   LLM (LLaMA) │          │
│                                 └─────────────────┘          │
│                                            │                  │
│                                            ▼                  │
│                                 ┌─────────────────┐          │
│                                 │   Response    │          │
│                                 │  Formatting  │          │
│                                 └─────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Detailed Flow**:

```
Step 1: Receive Question (queryController.askQuestion)
───────────────────────────────────────────────
User sends question → Extract question text → Validate non-empty

Step 2: Generate Query Embedding (embeddingService.generateEmbedding)
───────────────────────────────────────────────────────────────────
- Load embedding model
- Generate 384D vector for question
- Apply normalization

Step 3: Semantic Search (vectorService.searchSimilar)
────────────────────────────────────────────────
- Query ChromaDB with embedding
- Retrieve top-k=5 similar chunks
- Calculate cosine distances

Step 4: Check Relevance (ragService.askQuestion)
────────────────────────────────────────────────
- Calculate average distance
- IF avg distance > 1.5:
  - Use general knowledge only
- ELSE:
  - Include document context

Step 5: Construct LLM Prompt
────────────────────────────
SYSTEM PROMPT:
"You are a helpful document assistant..."

USER PROMPT:
"Document content: [retrieved chunks]
Question: [user question]
Instructions: Provide helpful answer..."

Step 6: Generate Response (grokClient.chat.completions.create)
───────────────────────────────────────────────────────────
- Send prompt to Groq LLaMA-3.1-8b
- Receive completion
- Extract response text

Step 7: Format Response
───────────────────────
- Add bullet points
- Add numbered lists
- Bold key terms
- Include source citations

Step 8: Return to Client
────────────────────
Response includes:
- answer: LLM response
- sources: Retrieved chunks with distances
- isGeneralKnowledge: Boolean flag
```

**Key Functions**:

| Function              | Input            | Output          | Responsibility         |
| --------------------- | ---------------- | --------------- | ---------------------- |
| `askQuestion()`       | Question text    | Response object | RAG pipeline           |
| `generateEmbedding()` | Text             | Query vector    | Create query embedding |
| `searchSimilar()`     | Query vector     | Top chunks      | Semantic search        |
| `generateAnswer()`    | Chunks, question | LLM response    | Generate answer        |

### 3.3.3 Module 3: Evaluation & Report System

**Purpose**: Compare resumes to job descriptions and provide match analysis

**Module Components**:

```
┌─────────────────────────────────────────────────────────────────┐
│         MODULE 3: EVALUATION & REPORT SYSTEM                 │
├─────────────────���─���─────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Resume   │    │  Job Desc  │    │  Compare   │        │
│  │    Text   │    │   Text    │    │  Request  │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│        │                  │               │                        │
│        └─────────────────┼───────────┘                        │
│                          ▼                                   │
│               ┌─────────────────────┐                       │
│               │   Compare Service   │                       │
│               └─────────────────────┘                       │
│                          │                                  │
│                          ▼                                  │
│               ┌─────────────────────┐                       │
│               │   Skill Extraction │                       │
│               │   (keyword match)   │                       │
│               └─────────────────────┘                       │
│                          │                                  │
│                          ▼                                  │
│               ┌─────────────────────┐                       │
│               │   LLM Analysis     │                       │
│               │   (groqClient)     │                       │
│               └─────────────────────┘                       │
│                          │                                  │
│                          ▼                                  │
│               ┌─────────────────────┐                       │
│               │   Score & Report   │                       │
│               │   Generation      │                       │
│               └─────────────────────┘                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Detailed Flow**:

```
Step 1: Receive Comparison Request (compareController.compareResume)
────────────────────────────────────────────────────────────────
User provides: resume text, job description

Step 2: Extract Skills (compareService.extractSkills)
─────────────────────────────────────────────────────────
Resume:
- Technical skills (JavaScript, Python, etc.)
- Soft skills (leadership, communication)
- Domain skills

Job Description:
- Required skills
- Preferred skills
- Experience requirements

Step 3: Skill Matching
────────────────────────────
Compare extracted skills:
- Required skills found in resume → Match
- Required skills missing → Gap
- Preferred skills present → Bonus

Step 4: LLM Analysis (optional)
────────────────────────────────────────────────────────────────
- Send comparison to Groq
- Get professional assessment
- Receive feedback

Step 5: Calculate Scores
────────────────────────────
matchScore = (matched_required / total_required) * 100
bonusScore = (matched_preferred / total_preferred) * 20

Total Score = matchScore + bonusScore (capped at 100)

Step 6: Generate Report
────────────────────────────
{
  matchScore: 75,
  matchedSkills: [...],
  missingSkills: [...],
  suggestions: [...]
}

Step 7: Return Results
────────────────────────────
User receives visual report with:
- Overall score
- Skill visualization
- Gap analysis
- Improvement suggestions
```

---

## 3.4 System Design Tools

### 3.4.1 Data Flow Diagrams (DFD)

**Level 0: Context Diagram**

```
┌─────────────────────────────────────────┐
│            EXTERNAL ENTITY               │
│              (User)                   │
└──────────────────┬──────────────────┘
                    │
                    │ Upload Document / Ask Question / Search Jobs
                    ▼
┌─────────────────────────────────────────┐
│          SYSTEM BOUNDARY                  │
│    RAG Document Scanner Platform        │
│                                        │
│  ┌─────────────────────────────────┐  │
│  │     Main Process (Server)        │  │
│  │  Upload → Process → Store       │  │
│  │  Query → Search → Answer       │  │
│  │  Skills → API → Jobs          │  │
│  └─────────────────────────────────┘  │
└──────────────────┬──────────────────┘
                    │
                    │ Responses / Answers / Jobs
                    ▼
┌─────────────────────────────────────────┐
│            EXTERNAL ENTITY               │
│              (User)                   │
└─────────────────────────────────────────┘
```

**Level 1: Process Decomposition**

```
User Input
      │
      ├──────────────────────────────┐
      │                              │
      ▼                              ▼
┌──────────────┐            ┌──────────────┐
│  DOC PROCESS │            │  QUERY PROC  │
├──────────────┤            ├──────────────┤
│ Upload     │            │ Ask Question│
│ Extract   │            │ Embed Query │
│ Classify  │            │ Search     │
│ Chunk    │            │ Retrieve   │
│ Embed    │            │ Generate   │
│ Store    │            │ Respond    │
└──────────────┘            └──────────────┘
      │                              ���
      │                              ▼
      │                    ┌──────────────┐
      │                    │   JOBS     │
      │                    ├──────────────┤
      │                    │ Get Skills │
      │                    │ Query API │
      │                    │ Filter   │
      │                    │ Rank    │
      │                    └──────────────┘
      ▼
┌──────────────┐
│  VECTOR DB   │
│ (ChromaDB)  │
└──────────────┘
```

**Level 2: Technical Flow**

```
HTTP Request
      │
      ▼
┌──────────────┐
│   Express   │
│   Server    │
└──────┬──────┘
       │ Route Match
       ▼
┌──────────────┐
│ Controller  │
│ (function) │
└──────┬──────┘
       │ Call
       ▼
┌──────────────┐
│   Service  │
│ (logic)    │
└──────┬──────┘
       │ External Call
       ▼          ▼          ▼        ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │MongoDB│  │ChromaDB│  │Groq   │
   └────────┘  └────────┘  └────────┘
                    │
                    ▼
       ┌──────────────┐
       │   Format    │
       │ Response   │
       └──────┬──────┘
              │
              ▼
         JSON Response
```

### 3.4.2 Data Dictionary

**Document Processing Data:**

| Data Element  | Type   | Description    | Valid Range     |
| ------------- | ------ | -------------- | --------------- |
| documentFile  | File   | Uploaded file  | PDF/image       |
| extractedText | String | OCR output     | 10-100000 chars |
| textChunks    | Array  | Split segments | 1-100 items     |
| embeddings    | Array  | 384D vectors   | [-1, 1]^384     |
| category      | Enum   | Document type  | 6 values        |

**Question Answering Data:**

| Data Element    | Type   | Description  | Valid Range  |
| --------------- | ------ | ------------ | ------------ |
| question        | String | User query   | 1-1000 chars |
| queryEmbedding  | Array  | Query vector | 384D         |
| retrievedChunks | Array  | Results      | 0-10 items   |
| answer          | String | LLM response | 1-3000 chars |
| sources         | Array  | Citations    | 0-5 items    |

**Job Search Data:**

| Data Element | Type   | Description     | Valid Range |
| ------------ | ------ | --------------- | ----------- |
| keywords     | String | Search terms    | 1-200 chars |
| location     | String | Job location    | 0-100 chars |
| jobs         | Array  | Results         | 0-50 items  |
| jobTitle     | String | Position        | -           |
| company      | String | Employer        | -           |
| jobLink      | String | Application URL | -           |

### 3.4.3 Structured Charts

**Server Structure:**

```
server/
├── server.js                   # Entry point
├── package.json               # Dependencies
├── .env                     # Configuration
├── config/
│   ├── database.js          # MongoDB connection
│   └── grokClient.js       # Groq API client
├── controllers/
│   ├── uploadController.js
│   ├── queryController.js
│   ├── jobsController.js
│   ├── suggestedQuestionsController.js
│   ├── compareController.js
│   └── shareController.js
├── services/
│   ├── ocrService.js
│   ├── chunkService.js
│   ├── embeddingService.js
│   ├── vectorService.js
│   ├── ragService.js
│   ├── classificationService.js
│   └── compareService.js
├── routes/
│   ├── uploadRoutes.js
│   ├── queryRoutes.js
│   ├── jobsRoutes.js
│   ├── suggestedQuestionsRoutes.js
│   ├── compareRoutes.js
│   └── shareRoutes.js
├── models/
│   ├── User.js
│   └── ChatShare.js
├── middleware/
│   └── auth.js
└── uploads/                   # File storage
```

**Service Dependencies:**

```
uploadController
    ├── ocrService.extractTextFromFile
    ├── chunkService.chunkText
    ├── embeddingService.generateEmbeddings
    ├── vectorService.initializeVectorStore
    ├── vectorService.addDocuments
    ├── vectorService.clearCollection
    ├── classificationService.classifyDocument
    └── documentStore.storeDocument

queryController
    ├── ragService.askQuestion

jobsController
    └── (direct Groq fetch)

suggestedQuestionsController
    ├── embeddingService.generateEmbedding
    ├── vectorService.searchSimilar
    └── grokClient (question generation)

compareController
    └── compareService.compareResume
```

### 3.4.4 UML Diagrams

**Class Diagram (Core Services):**

```
┌─────────────────────────────────────────┐
│            VectorService               │
├─────────────────────────────────────────┤
│ - chromaClient: ChromaClient          │
│ - collection: Collection             │
├─────────────────────────────────────────┤
│ + initializeVectorStore()            │
│ + addDocuments(documents)             │
│ + searchSimilar(query, topK)         │
│ + clearCollection()                   │
└─────────────────────────────────────────┘
              │
              │ uses
              ▼
┌─────────────────────────────────────────┐
│           EmbeddingService              │
├─────────────────────────────────────────┤
│ - pipeline: Pipeline                 │
├─────────────────────────────────────────┤
│ + getEmbeddingPipeline()             │
│ + generateEmbedding(text)             │
│ + generateEmbeddings(texts)          │
└─────────────────────────────────────────┘
              │
              │ uses
              ▼
┌─────────────────────────────────────────┐
│           grokClient                 │
├─────────────────────────────────────────┤
│ - apiKey: String                    │
│ - baseURL: String                  │
├─────────────────────────────────────────┤
│ + chat.completions.create(params)     │
└─────────────────────────────────────────┘
```

**Sequence Diagram (Document Upload):**

```
User     Express   Controller   OCR    Embedding  Vector  Classify
  │         │         │          │        │         │       │
  │──POST───▶│         │          │        │         │       │
  │         │──invoke──▶│         │        │         │       │
  │         │          │         │        │         │       │
  │         │────invoke───────▶│        │         │       │
  │         │          │──return───▶│        │         │       │
  │         │          │          │        │         │       │
  │         │──────────────────────▶│        │       │
  │         │          │          │──return───▶│       │
  │         │          │          │        │         │       │
  │         │          │          │──invoke───────▶│
  │         │          │          │        │   │──return▶│
  │         │◀──return───│         │        │         │       │
  │◀───────│         │          │        │         │       │
```

**Sequence Diagram (Question Answering):**

```
User    Express   Controller   Embedding   Vector   Groq
  │        │         │          │        │      │
  │──POST──▶│        │          │        │      │
  │        │──invoke──▶│        │        │      │
  │        │          │──invoke──▶│        │      │
  │        │          │          │──search▶│
  │        │          │          │◀-chunks-│
  │        │          │◀-return──│        │      │
  │        │          │          │        │      │
  │        │─────────────────────────▶│      │
  │        │          │          │        │───▶│
  │        │          │          │    ◀-answer│
  │        │◀-return───────────────────│      │
  │◀──────│        │          │        │      │
```

---

## 3.5 User Interface Design

### 3.5.1 Page Layout

**Overall Layout Structure:**

```
┌──────────────────────────────────────────────────────────────┐
│                        NAVBAR                               │
│  ┌──────────┐ ┌──────────────────────────────────┐  ┌──┐ │
│  │  Logo   │ │          Navigation Links           │  │CV│ │
│  └──────────┘ └──────────────────────────────────┘  └──┘ │
├──────────────────────────────────────────────────────────────┤
│                                                            │
│                      MAIN CONTENT                           │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │                                                    │   │
│  │              Page-Specific Content                 │   │
│  │                                                    │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
├──────────────────────────────────────────────────────────────┤
│                        FOOTER                             │
│              © 2026 RAG Document Platform                 │
└──────────────────────────────────────────────────────────────┘
```

### 3.5.2 Key Pages

**Dashboard Page:**

```
┌────────────────────────────────────────────────────────────┐
│  Welcome, [User Name]                                       │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │Document   │ │Questions   │ │Jobs       │          │
│  │Processed  │ │Answered   │ │Found     │          │
│  │    12    │ │    45    │ │    23    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├────────────────────────────────────────────────────────────┤
│  Recent Activity                                          │
│  • Uploaded resume.pdf - 2 hours ago                      │
│  • Viewed jobs - Java Developer - 5 hours ago            │
│  • Asked question about experience - 1 day ago           │
└────────────────────────────────────────────────────────────┘
```

**Chat Interface:**

```
┌────────────────────────────────────────────────────────────┐
│  Document Q&A                                           │
├────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐   │
│  │ BOT: How can I help you with your document?     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                     │
│  ┌────────────────────────────────────────────────────┐   │
│  │ YOU: What Python frameworks have you worked with?  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                     │
│  ┌────────────────────────────────────────────────────┐   │
│  │ BOT: Based on your resume, you have experience   │   │
│  │ with Django and Flask frameworks...           │   │
│  │                                            │   │
│  │ Source: Work Experience Section, Page 1         │   │
│  └──────────────��─��───────────────────────────────────┘   │
│                                                     │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Suggested Questions:                          │   │
│  │ • What specific projects did you build?         │   │
│  │ • How did you optimize performance?          │   │
│  └────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────┐
│  Type your question...                        [Send]       │
└────────────────────────────────────────────────────────────┘
```

**Jobs Mode:**

```
┌────────────────────────────────────────────────────────────┐
│  Job Search                                            │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐    │
│  │  Keywords: [JavaScript Developer    ] [🔍 ]│   │
│  └─────────────────────────────────────────────┘    │
├────────────────────────────────────────────────────────────┤
│  Results: 23 jobs found                               │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐    │
│  │ Frontend Developer - TechCorp               │    │
│  │ Remote • $80-120k                         │    │
│  │ React, JavaScript, TypeScript              │    │
│  │ Posted: 2 days ago           [View Apply] │   │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Full Stack Engineer - StartupXYZ            │    │
│  │ San Francisco • $100-150k                  │    │
│  │ React, Node, Python                       │    │
│  │ Posted: 5 days ago           [View Apply] │   │
│  └─────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

---

## 3.6 Database Design

### 3.6.1 ER Diagram

**User Entity:**

```
┌────────────────────────────────────���─���───┐
│              user                       │
├──────────────────────────────────────────┤
│ _id: ObjectId (PK)                     │
│ name: String (required)                │
│ email: String (required, unique)       │
│ password: String (required)          │
│ role: Enum [student, medical,         │
│            finance, admin]            │
│ emailVerified: Boolean               │
│ verificationToken: String           │
│ createdAt: Date                     │
│ updatedAt: Date                     │
└──────────────────────────────────────────┘
                   │
                   │ 1:N
                   ▼
┌──────────────────────────────────────────┐
│            chat_share                  │
├──────────────────────────────────────────┤
│ _id: ObjectId (PK)                     │
│ sessionId: String                     │
│ userId: ObjectId (FK)                │
│ chats: Array                         │
│ createdAt: Date                     │
│ expiresAt: Date                     │
└──────────────────────────────────────────┘
```

**Document Metadata (NoSQL):**

```
┌──────────────────────────────────────────┐
│         document_metadata              │
├──────────────────────────────────────────┤
│ _id: ObjectId (PK)                     │
│ filename: String                     │
│ textPreview: String (500 chars)       │
│ category: String (enum)             │
│ chunksCreated: Number               │
│ uploadedAt: Date                   │
└──────────────────────────────────────────┘
```

**Vector Storage (ChromaDB):**

```
┌──────────────────────────────────────────┐
│         documents_collection            │
├──────────────────────────────────────────┤
│ id: String (PK) "doc_0", "doc_1"...    │
│ embedding: Array (384 floats)           │
│ document: String (chunk text)        │
│ metadata: {                          │
│   source: String (filename)          │
│ }                                   │
└──────────────────────────────────────────┘
```

### 3.6.2 Normalization

**User Schema (3NF):**

```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // Don't return by default
  },
  role: {
    type: String,
    enum: ["student", "finance", "medical", "admin"],
    default: "student",
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

**ChatShare Schema (3NF):**

```javascript
const chatShareSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chats: [
    {
      role: String,
      content: String,
      timestamp: Date,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});
```

### 3.6.3 Database Manipulation

**User Operations:**

| Operation     | Mongoose Method            | Use Case         |
| ------------- | -------------------------- | ---------------- |
| Create user   | `User.create()`            | Registration     |
| Find by email | `User.findOne({email})`    | Login            |
| Find by ID    | `User.findById(id)`        | Profile          |
| Update        | `User.findByIdAndUpdate()` | Settings         |
| Delete        | `User.findByIdAndDelete()` | Account deletion |

**Chat Share Operations:**

| Operation         | Mongoose Method                                 | Use Case     |
| ----------------- | ----------------------------------------------- | ------------ |
| Create session    | `ChatShare.create()`                            | New chat     |
| Find by sessionId | `ChatShare.findOne({sessionId})`                | Load shared  |
| Append messages   | `.updateOne({$push: {chats}})`                  | Add messages |
| Delete expired    | `ChatShare.deleteMany({expiresAt: {$lt: now}})` | Cleanup      |

### 3.6.4 Database Connection Controls

**MongoDB Connection:**

```javascript
export const connectDB = async () => {
  try {
    const mongoURL =
      process.env.MONGO_URL || "mongodb://mongo:27017/rag-doc-platform";
    await mongoose.connect(mongoURL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
```

**ChromaDB Connection:**

```javascript
async function getChromaClient() {
  if (!chromaClient) {
    const chromaUrl = process.env.CHROMA_URL || "http://chromadb:8000";
    chromaClient = new ChromaClient({
      path: chromaUrl,
    });
  }
  return chromaClient;
}
```

---

## 3.7 Methodology: RAG + AI Pipeline

### 3.7.1 RAG Architecture

Retrieval-Augmented Generation (RAG) combines semantic search with large language models:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              RAG ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │          INDEXING PIPELINE                   │   │
│  │                                           │   │
│  │  Document → Split → Embed → Store           │   │
│  │      (500 tokens) (384D) (ChromaDB)       │   │
│  └──────────────────────────────────────────────┘   │
│                      │                             │
│                      ▼                             │
│  ┌──────────────────────────────────────────────┐   │
│  │          RETRIEVAL PIPELINE                  │   │
│  │                                           │   │
│  │  Query → Embed → Search → Top-K             │   │
│  │            (384D) (cosine) (k=5)          │   │
│  └───────────────────────��─��────────────────────┘   │
│                      │                             │
│                      ▼                             │
│  ┌──────────────────────────────────────────────┐   │
│  │         GENERATION PIPELINE                   │   │
│  │                                           │   │
│  │  Prompt = System + Context + Question       │   │
│  │  LLM (Groq LLaMA-3.1-8B)                │   │
│  │  Response → Format → Return                │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 3.7.2 Document Processing Pipeline

**Step-by-Step Process:**

1. **Document Upload**
   - File received via multipart form
   - Multer middleware handles file
   - File saved to /uploads directory

2. **Text Extraction**

   ```javascript
   if (mimeType === "application/pdf") {
     const dataBuffer = fs.readFileSync(filePath);
     const data = await pdf(dataBuffer);
     return data.text;
   } else if (mimeType.startsWith("image/")) {
     const result = await Tesseract.recognize(filePath, "eng");
     return result.data.text;
   }
   ```

3. **Text Chunking**
   - Split text into sentences
   - Group sentences into chunks
   - Target: 500 tokens per chunk
   - Overlap: 100 tokens

4. **Embedding Generation**
   - Load all-MiniLM-L6-v2 model
   - Process each chunk
   - Apply mean pooling
   - Normalize output vectors (L2)

5. **Storage**
   - Initialize ChromaDB collection
   - Add documents with embeddings
   - Store metadata (source filename)

### 3.7.3 Question Answering Pipeline

**Step-by-Step Process:**

1. **Query Reception**
   - Receive question from client
   - Validate input (non-empty, < 1000 chars)

2. **Query Embedding**

   ```javascript
   const queryEmbedding = await generateEmbedding(question);
   // Returns 384-dimensional normalized vector
   ```

3. **Semantic Search**

   ```javascript
   const results = await collection.query({
     queryEmbeddings: [queryEmbedding],
     nResults: 5, // Top 5 results
   });
   // Returns: documents[], distances[], metadatas[]
   ```

4. **Relevance Check**

   ```javascript
   const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
   const hasRelevantContent = avgDistance < 1.5;
   ```

5. **Prompt Construction**

   ```javascript
   const prompt = `
   Document content:
   ${retrievedChunks.join("\n\n")}
   
   Question: ${question}
   
   Provide helpful answer...
   `;
   ```

6. **LLM Generation**

   ```javascript
   const response = await groqClient.chat.completions.create({
     model: "llama-3.1-8b-instant",
     messages: [
       { role: "system", content: systemPrompt },
       { role: "user", content: prompt },
     ],
     temperature: 0.6,
     max_tokens: 3000,
   });
   ```

7. **Response Formatting**
   - Add bullet points (•)
   - Add numbered lists (1., 2., 3.)
   - Bold key terms (**text**)
   - Include source citations

8. **Response Return**
   ```javascript
   return {
     answer: responseText,
     sources: retrievedChunks.map((chunk, i) => ({
       chunk,
       distance: distances[i],
     })),
     isGeneralKnowledge: !hasRelevantContent,
   };
   ```

### 3.7.4 API Key and Environment Configuration

**Environment Variables:**

```
# Server
PORT=5000
NODE_ENV=production

# MongoDB
MONGO_URL=mongodb://mongo:27017/rag-doc-platform

# ChromaDB
CHROMA_URL=http://chromadb:8000

# Groq
GROQ_API_KEY=gsk_xxxxx

# Jooble
JOOBLE_API_KEY=78a33259-da82-483c-8079-986961a19305
```

---

# Chapter 4: IMPLEMENTATION, TESTING AND MAINTENANCE

## 4.1 Tools, Technologies and IDEs Used

### 4.1.1 Development Tools

| Category        | Tool               | Version | Purpose                      |
| --------------- | ------------------ | ------- | ---------------------------- |
| IDE             | Visual Studio Code | Latest  | Code editing                 |
| Runtime         | Node.js            | v20     | JavaScript runtime           |
| Package Manager | npm                | Latest  | Dependency management        |
| Container       | Docker             | Latest  | Application containerization |
| Orchestration   | Docker Compose     | Latest  | Multi-container management   |
| Browser         | Chrome/Edge        | Latest  | Testing                      |

### 4.1.2 Frontend Technologies

| Technology   | Version | Purpose      |
| ------------ | ------- | ------------ |
| React.js     | 18.x    | UI framework |
| Vite         | 5.x     | Build tool   |
| Tailwind CSS | 3.x     | Styling      |
| Axios        | 1.x     | HTTP client  |
| React Router | 6.x     | Navigation   |

### 4.1.3 Backend Technologies

| Technology           | Version | Purpose             |
| -------------------- | ------- | ------------------- |
| Express.js           | 4.21.x  | Web framework       |
| Mongoose             | 8.x     | MongoDB ODM         |
| Chromadb             | 1.8.x   | Vector database     |
| @xenova/transformers | 2.17.x  | Embeddings          |
| Groq SDK             | 4.77.x  | LLM client          |
| Tesseract.js         | 5.1.x   | OCR                 |
| pdf-parse            | 1.1.x   | PDF text extraction |
| Multer               | 1.4.x   | File upload         |
| Cors                 | 2.8.x   | Cross-origin        |
| Dotenv               | 16.x    | Environment config  |

### 4.1.4 Key Dependencies (package.json)

```json
{
  "name": "rag-doc-server",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@xenova/transformers": "^2.17.2",
    "axios": "^1.6.5",
    "bcryptjs": "^2.4.3",
    "chromadb": "^1.8.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "openai": "^4.77.0",
    "pdf-parse": "^1.1.1",
    "pdfjs-dist": "^4.4.168",
    "sharp": "^0.34.5",
    "tesseract.js": "^5.1.1"
  }
}
```

---

## 4.2 Coding Standards

### 4.2.1 JavaScript Standards

**ES Modules:**

All files use ES module syntax:

```javascript
// Import
import express from "express";
import { searchSimilar } from "./vectorService.js";

// Export
export async function askQuestion(question) {
  // Implementation
}

export default { askQuestion };
```

**Async/Await:**

Promises handled with async/await:

```javascript
// Good
const result = await someAsyncFunction();

// Avoid
someAsyncFunction().then(result => { ... });
```

**Error Handling:**

All async operations wrapped in try-catch:

```javascript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error("Operation failed:", error.message);
  throw error;
}
```

### 4.2.2 File Naming Conventions

| Type             | Convention | Example           |
| ---------------- | ---------- | ----------------- |
| JavaScript       | camelCase  | vectorService.js  |
| React Components | PascalCase | ChatInterface.jsx |
| CSS              | kebab-case | auth.module.css   |

### 4.2.3 Code Structure

Each service follows consistent pattern:

```javascript
// 1. External imports
import express from "express";

// 2. Internal imports
import { generateEmbedding } from "./embeddingService.js";

// 3. Constants
const DEFAULT_TOP_K = 5;

// 4. Helper functions
function formatResponse(data) {
  return data;
}

// 5. Main functions
export async function mainFunction(param) {
  try {
    const result = await process(param);
    return formatResponse(result);
  } catch (error) {
    console.error("Main function error:", error);
    throw error;
  }
}

// 6. Default export
export default { mainFunction };
```

### 4.2.4 API Response Format

**Success Response:**

```javascript
{
  status: 'success',
  data: { /* response data */ },
  message: 'Optional success message'
}
```

**Error Response:**

```javascript
{
  status: 'error',
  error: 'Error message',
  details: 'Optional details'
}
```

---

## 4.3 Project Scheduling

### 4.3.1 Development Timeline

| Week | Phase      | Tasks                     | Deliverables       |
| ---- | ---------- | ------------------------- | ------------------ |
| 1    | Setup      | Git, Docker, dependencies | Project structure  |
| 2    | Backend    | Server, routes, MongoDB   | API endpoints      |
| 3    | Processing | OCR, embeddings, ChromaDB | Upload pipeline    |
| 4    | RAG        | Query pipeline, LLM       | Question answering |
| 5    | Frontend   | React setup, Dashboard    | Basic UI           |
| 6    | Features   | Chat, Jobs, Compare       | Complete UI        |
| 7    | Testing    | Integration tests         | Test results       |
| 8    | Deployment | Docker Compose            | Running app        |

### 4.3.2 Task List

- [x] Initialize project structure
- [x] Configure Docker Compose
- [x] Set up Express server
- [x] Connect MongoDB
- [x] Connect ChromaDB
- [x] Implement OCR service
- [x] Implement embedding service
- [x] Implement RAG pipeline
- [x] Build React frontend
- [x] Create chat interface
- [x] Add jobs mode
- [x] Add compare mode
- [x] Test integration
- [x] Deploy with Docker

---

## 4.4 Testing Techniques and Test Plans

### 4.4.1 Testing Types

**Unit Testing:**

Testing individual functions:

```javascript
// Test chunkText function
const chunks = chunkText("Sample text. More text.");
assert(Array.isArray(chunks));
assert(chunks.length > 0);
```

**Integration Testing:**

Testing API endpoints:

```javascript
// Test /api/upload
const response = await request(app)
  .post("/api/upload")
  .attach("file", "resume.pdf");

expect(response.status).toBe(200);
```

**End-to-End Testing:**

Testing full user flows:

```javascript
// Test upload-to-query flow
await uploadDocument("resume.pdf");
const answer = await askQuestion("What skills?");
expect(answer).toContain("JavaScript");
```

### 4.4.2 Test Scenarios

| Feature | Test Case      | Input          | Expected        |
| ------- | -------------- | -------------- | --------------- |
| Upload  | PDF upload     | resume.pdf     | Text extracted  |
| Upload  | Image upload   | resume.png     | OCR text        |
| Ask     | Valid question | "What skills?" | Answer returned |
| Ask     | No document    | "Any question" | General answer  |
| Jobs    | With keywords  | "Java Dev"     | Jobs filtered   |
| Jobs    | No keywords    | ""             | Jobs from text  |
| Compare | Resume + JD    | Resume text    | Match score     |

### 4.4.3 Manual Testing Checklist

- [ ] Upload PDF successfully
- [ ] Upload image successfully
- [ ] Receive processing status
- [ ] Ask question and get answer
- [ ] Verify source citations
- [ ] Search jobs
- [ ] Compare resume with job
- [ ] Responsive design works

---

# Chapter 5: RESULTS AND DISCUSSION

## 5.1 User Interface and System Modules

### 5.1.1 Dashboard Interface

The dashboard provides an overview of system capabilities:

- Document processing statistics
- Recent activity display
- Quick action buttons
- Category-based views

**Features:**

- Document count
- Questions answered
- Jobs found
- Recent activity timeline

### 5.1.2 Upload Interface

Drag-and-drop file upload with progress:

- File type validation (PDF, PNG, JPG)
- File size limit (50MB)
- Category display after processing
- Chunk count information

### 5.1.3 Chat Interface

Interactive question-answering interface:

- Message history
- Typing indicators
- Source citations
- Suggested questions panel

### 5.1.4 Jobs Mode

Job search and listing:

- Keyword search
- Location filtering
- Job cards with details
- Application links

### 5.1.5 Compare Mode

Resume-job comparison:

- Side-by-side display
- Match percentage
- Gap visualization
- Improvement suggestions

---

## 5.2 Snapshots of System

### 5.2.1 API Response: Document Upload

```json
{
  "message": "Document processed successfully",
  "chunksCreated": 12,
  "documentName": "resume.pdf",
  "documentText": "John is a software engineer with 5 years of...",
  "uploadedAt": "2026-04-21T10:00:00.000Z",
  "category": "resume"
}
```

### 5.2.2 API Response: Question Answering

```json
{
  "answer": "Based on your resume, you have 5 years of professional experience in software development. Your key technical skills include JavaScript, React, and Node.js...",
  "sources": [
    {
      "chunk": "Work Experience\nSoftware Engineer\n2020-Present",
      "distance": 0.45
    }
  ],
  "isGeneralKnowledge": false
}
```

### 5.2.3 API Response: Suggested Questions

```json
{
  "questions": [
    "What specific technologies did John use to build production GenAI applications?",
    "How did he reduce hallucinations in GenAI applications?",
    "What was the improvement in retrieval accuracy achieved?",
    "Can you describe the architecture of the CORPWISE project?",
    "How did John's experience contribute to his professional development?",
    "What were the key achievements in his internship?"
  ],
  "skills": ["javascript", "react", "python", "java"],
  "category": "resume",
  "isDynamic": true
}
```

### 5.2.4 API Response: Job Search

```json
{
  "jobs": [
    {
      "id": "-1442085747849029600",
      "title": "Full-Stack Java & React Developer",
      "company": "INFT Solutions Inc",
      "location": "Lincoln, NE",
      "snippet": "Job Title: Full-Stack Java & React Developer...",
      "link": "https://jooble.org/jdp/-1442085747849029626",
      "type": "Full-time",
      "salary": "",
      "posted": "2026-03-24T16:49:54.0930000"
    }
  ],
  "keywords": ["javascript", "react", "developer"],
  "searchQuery": "javascript developer react",
  "totalResults": 9151
}
```

---

## 5.3 Back-end Representation

### 5.3.1 Server Architecture

```
Express Server (Port 5000)
├── /api/upload (POST)
│   └── uploadController.js
│       ├── ocrService.extractTextFromFile
│       ├── chunkService.chunkText
│       ├── classificationService.classifyDocument
│       ├── embeddingService.generateEmbeddings
│       └── vectorService.addDocuments
│
├── /api/ask (POST)
│   └── queryController.js
│       ├── ragService.askQuestion
│       │   ├── embeddingService.generateEmbedding
│       │   ├── vectorService.searchSimilar
│       │   └── grokClient.chat.completions.create
│
├── /api/suggested-questions (GET)
│   └── suggestedQuestionsController.js
│       ├── embeddingService.generateEmbedding
│       ├── vectorService.searchSimilar
│       └── grokClient.chat.completions.create
│
├── /api/jobs (POST)
│   └── jobsController.js
│       └── fetch (Jooble API)
│
└── /api/compare (POST)
    └── compareController.js
        └── compareService.compareResume
```

### 5.3.2 Database Connections

- **MongoDB**: User data, session storage (mongo:27017)
- **ChromaDB**: Vector storage (chromadb:8000)
- **Groq API**: External LLM service

---

## 5.4 Discussion of Results

### 5.4.1 Performance Metrics

| Operation             | Time          | Status  |
| --------------------- | ------------- | ------- |
| PDF Upload (10 pages) | ~8s           | ✅ Pass |
| Image OCR             | ~15s          | ✅ Pass |
| Embedding Generation  | ~3s per chunk | ✅ Pass |
| Question Answering    | ~3s           | ✅ Pass |
| Job Search            | ~4s           | ✅ Pass |
| Compare               | ~4s           | ✅ Pass |

### 5.4.2 Key Features Verified

| Feature                | Status | Notes          |
| ---------------------- | ------ | -------------- |
| Document Upload        | ✅     | PDF and images |
| OCR Extraction         | ✅     | Tesseract.js   |
| Classification         | ✅     | 6 categories   |
| Semantic Search        | ✅     | ChromaDB       |
| RAG Question Answering | ✅     | With sources   |
| Dynamic Questions      | ✅     | LLM generation |
| Job Search             | ✅     | Jooble API     |
| Resume Comparison      | ✅     | Match scoring  |

### 5.4.3 Limitations

1. **In-Memory Storage**: Document not persists across restarts
2. **Single Document**: Only one active document at a time
3. **API Rate Limits**: Free tier has usage limits
4. **Token Limits**: LLM responses capped at 3000 tokens
5. **No Authentication**: Currently public access

---

## 5.5 Future Enhancements

### Short-term (3 months):

- [ ] Persistent document storage
- [ ] User authentication
- [ ] Multiple document support
- [ ] Chat history persistence

### Medium-term (6 months):

- [ ] Real-time collaboration
- [ ] Advanced job filters
- [ ] More job APIs
- [ ] Resume builder

### Long-term (12 months):

- [ ] Multi-language OCR
- [ ] Voice interface
- [ ] Mobile applications
- [ ] Enterprise features

---

# Chapter 6: CONCLUSION AND FUTURE SCOPE

## 6.1 Summary of Findings

### 6.1.1 Technical Achievements

The RAG Document Scanner & AI Interview Platform successfully implements:

1. **Complete RAG Pipeline**
   - Document upload and processing
   - Text extraction and chunking
   - Embedding generation and storage
   - Semantic search and question answering

2. **AI Integration**
   - Groq LLaMA-3.1-8b-Instant for generation
   - Dynamic question generation
   - Resume-job matching
   - Source citation

3. **Production Infrastructure**
   - Docker containerization
   - MongoDB for user data
   - ChromaDB for vectors
   - Express.js REST API

### 6.1.2 Functional Achievements

- Multi-format document upload
- Automatic classification
- RAG-based question answering
- Dynamic question generation
- Job search integration
- Resume comparison

---

## 6.2 Conclusion

### 6.2.1 Project Success

The RAG Document Scanner & AI Interview Platform achieves its primary objectives:

1. **Automated Document Processing**: Users upload documents and receive instant text extraction, classification, and vector storage.

2. **Intelligent Question Answering**: RAG pipeline provides context-aware answers with source citations, demonstrating true document understanding.

3. **Dynamic Features**: Questions and job matches are generated based on actual document content, not generic templates.

4. **Production Ready**: Docker deployment enables consistent operation across environments.

### 6.2.2 Technical Insights

The project demonstrates:

- **RAG Architecture**: Combines retrieval with generation for accurate, contextual answers
- **Vector Search**: Enables semantic matching beyond keyword search
- **LLM Integration**: Provides natural language generation capabilities
- **Error Handling**: Graceful degradation ensures system reliability

### 6.2.3 Value Delivered

The platform provides practical value:

- **Efficiency**: Automated document processing saves time
- **Accuracy**: Document-specific responses improve relevance
- **Accessibility**: Web interface makes AI accessible to non-technical users
- **Scalability**: Docker enables horizontal scaling

---

## 6.3 Future Scope

### 6.3.1 Immediate Enhancements

**Enhanced Storage:**

- Add document persistence to MongoDB
- Support multiple active documents
- Allow document selection by user

**Authentication:**

- Implement user registration
- Add login/logout
- Protect API routes

**User Experience:**

- Save chat history
- Add export functionality
- Improve mobile responsiveness

### 6.3.2 Medium-term Goals

**AI Improvements:**

- Fine-tune embedding models
- Add hybrid search (keyword + semantic)
- Implement reranking

**Integration:**

- Connect LinkedIn API
- Add more job sources
- Integrate ATS systems

**Features:**

- Resume builder
- Cover letter generator
- Interview calendar

### 6.3.3 Long-term Vision

**Enterprise Features:**

- Multi-tenant architecture
- Team collaboration
- Custom workflow builder

**Advanced AI:**

- Multimodal input
- Voice queries
- Custom fine-tuned models

**Marketplace:**

- Plugin marketplace
- API marketplace
- Enterprise pricing

---

# References / Bibliography

## APIs and Documentation

1. **Groq API Documentation**
   - https://console.groq.com/docs
   - Model: llama-3.1-8b-instant

2. **ChromaDB Documentation**
   - https://docs.trychromadb.com
   - Version: 1.8.x

3. **Hugging Face Transformers**
   - https://huggingface.co/docs/transformers
   - Model: Xenova/all-MiniLM-L6-v2

4. **Tesseract.js**
   - https://tesseractjs.org
   - Version: 5.1.x

5. **MongoDB Documentation**
   - https://docs.mongodb.com

## Technical Standards

1. **RAG Architecture**
   - Lewis et al. (2020). "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"

2. **RESTful API Design**
   - Richardson Maturity Model
   - Fielding's REST constraints

3. **Vector Search**
   - Approximate Nearest Neighbor (ANN) algorithms

## Books and Courses

1. "Building LLM-Powered Applications" - Various online resources
2. "Modern Full-Stack Development" - Industry best practices
3. "Docker Deep Dive" - Containerization patterns

---

# Appendices

## Appendix A: Environment Variables

```bash
# Server
PORT=5000

# MongoDB
MONGO_URL=mongodb://mongo:27017/rag-doc-platform

# ChromaDB
CHROMA_URL=http://chromadb:8000

# API Keys
GROQ_API_KEY=your-groq-api-key
JOOBLE_API_KEY=your-jooble-api-key

# Security
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:5173
```

## Appendix B: Docker Compose

```yaml
version: "3.8"
services:
  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"

  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGO_URL=mongodb://mongo:27017/rag-doc-platform
      - CHROMA_URL=http://chromadb:8000
    depends_on:
      - mongo
      - chromadb

  frontend:
    build: ./client
    ports:
      - "5173:5173"
```

## Appendix C: API Reference

| Endpoint                 | Method | Description     |
| ------------------------ | ------ | --------------- |
| /api/upload              | POST   | Upload document |
| /api/ask                 | POST   | Ask question    |
| /api/suggested-questions | GET    | Get suggestions |
| /api/jobs                | POST   | Search jobs     |
| /api/compare             | POST   | Compare resume  |
| /api/share               | POST   | Create share    |

---

_Document Generated: April 2026_
_Project: RAG Document Scanner & AI Interview Platform_
_Version: 1.0.0_
_Total Pages: Approximately 50-55_
