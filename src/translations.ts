export type Language = 'en' | 'es';

export const translations = {
  en: {
    appTitle: 'Enterprise RAG',
    badge: 'PGVector 3072-dim',
    status: 'Live Engine',
    tabs: {
      playground: 'Playground',
      vault: 'Knowledge Vault',
      guardrails: 'Guardrails & Config'
    },
    subHeader: {
      antiHallucination: 'Anti-Hallucination Pipeline (0.0)',
      threshold: 'Threshold:'
    },
    chat: {
      inputPlaceholder: 'Ask a query over verified knowledge base...',
      send: 'Execute',
      presetsTitle: 'Quick Enterprise Queries:',
      sourceLabel: 'Source Document:',
      cosineLabel: 'Cosine Similarity:'
    },
    vault: {
      title: 'Indexed Vector Knowledge Base',
      subtitle: 'PostgreSQL PGVector HNSW chunks indexed with text-embedding-3-large (3072 dims)',
      docName: 'Document Name',
      size: 'Size',
      chunks: 'Vector Chunks',
      status: 'Status',
      simulateIngest: 'Ingest New Runbook'
    },
    guardrails: {
      title: 'Vector Retrieval & Guardrail Parameters',
      subtitle: 'Deterministic inference policies and semantic similarity thresholds',
      tempLabel: 'Temperature (Locked Determinism)',
      tempDesc: 'Zero sampling prevents speculative token generation or factual drift.',
      cosineLabel: 'Minimum Cosine Similarity Score',
      cosineDesc: 'Queries falling below this cosine distance are terminated by DLQ interceptors.',
      strictLabel: 'Strict Grounding Validation',
      strictDesc: 'Requires cryptographic provenance citation for every generated statement.'
    }
  },
  es: {
    appTitle: 'Enterprise RAG',
    badge: 'PGVector 3072-dim',
    status: 'Motor en Vivo',
    tabs: {
      playground: 'Playground RAG',
      vault: 'Bóveda de Documentos',
      guardrails: 'Parámetros & Guardrails'
    },
    subHeader: {
      antiHallucination: 'Canal Anti-Alucinación Activo (Temp: 0.0)',
      threshold: 'Umbral Coseno:'
    },
    chat: {
      inputPlaceholder: 'Consulte la base de conocimiento indexada...',
      send: 'Ejecutar',
      presetsTitle: 'Consultas Rápidas:',
      sourceLabel: 'Documento Fuente:',
      cosineLabel: 'Similitud Coseno:'
    },
    vault: {
      title: 'Base de Conocimiento Vectorial Indexada',
      subtitle: 'Fragmentos HNSW en PostgreSQL PGVector con text-embedding-3-large (3072 dims)',
      docName: 'Nombre del Documento',
      size: 'Tamaño',
      chunks: 'Fragmentos',
      status: 'Estado',
      simulateIngest: 'Indexar Nuevo Documento'
    },
    guardrails: {
      title: 'Parámetros de Recuperación y Guardrails',
      subtitle: 'Políticas de inferencia determinista y umbrales de similitud semántica',
      tempLabel: 'Temperatura (Determinismo Estricto)',
      tempDesc: 'Muestreo cero previene la extrapolación especulativa o alucinaciones.',
      cosineLabel: 'Puntuación Mínima de Similitud Coseno',
      cosineDesc: 'Consultas por debajo de este umbral se bloquean preventivamente.',
      strictLabel: 'Validación de Fundamentación Estricta',
      strictDesc: 'Exige cita de procedencia verificable para cada afirmación generada.'
    }
  }
};
