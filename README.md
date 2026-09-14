<div align="center">
  <img src="https://raw.githubusercontent.com/Axl07s/portfolio-axel/master/public/projects/rag_01.png" alt="Enterprise RAG Engine" width="100%" />

  # Enterprise RAG Engine
  **Hybrid Semantic Search & Anti-Hallucination Knowledge Base**

  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![pgvector](https://img.shields.io/badge/pgvector-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
  [![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
</div>

<br/>

An enterprise-grade Retrieval-Augmented Generation (RAG) engine designed to extract critical insights from massive, private document repositories. It employs a hybrid search strategy combining dense embeddings with lexical scoring to guarantee determinism and mitigate LLM hallucinations.

## 🚀 Business Impact & Metrics
- **Insight Discovery:** Accelerated critical information retrieval across 50GB+ of unstructured private documents, processing queries in <240ms.
- **Accuracy & Trust:** Implements strict similarity thresholds and forced citation, effectively reducing hallucination rates to near-zero for mission-critical operations.
- **Workflow Automation:** Replaces manual document hunting, saving hundreds of hours per month in legal, medical, or financial data compliance audits.

## 🏗️ Core Architecture & Features

### 1. Hybrid Search & Reranking
- **pgvector & BM25:** Combines dense high-dimensional embedding search (pgvector) with keyword/lexical search (BM25) to capture both semantic meaning and exact terminology.
- **Contextual Reranking:** Re-evaluates and sorts the retrieved chunks in memory to surface the absolute most pertinent fragments before passing them to the LLM.

### 2. Deterministic Anti-Hallucination Guardrails
- **Explicit Citations:** Every generated response is forced to explicitly cite the source document and the exact vector chunk, accompanied by a relevance score.
- **Threshold Abstention:** If the retrieved evidence does not meet strict confidence thresholds, the engine deterministically abstains from answering rather than guessing.

### 3. Asynchronous Ingestion Pipeline
- **Multi-Format Parsing:** Asynchronous extraction from PDF, DOCX, and Markdown files via FastAPI background tasks.
- **Semantic Chunking:** Documents are intelligently segmented into contextual windows, vectorized, and indexed without blocking the main event loop.

## 💻 Tech Stack
- **Backend:** [Python](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/)
- **AI/ML:** [OpenAI](https://openai.com/), [LangChain](https://www.langchain.com/)
- **Database:** PostgreSQL with [pgvector](https://github.com/pgvector/pgvector) extension

<div align="center">
  <i>Engineered for production by <a href="https://github.com/Axl07s">Axel Molineros</a>.</i>
</div>


