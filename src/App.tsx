import { useState } from 'react';
import { 
  ArrowLeft, Send, Database, FileText, Sparkles, ShieldCheck, 
  Cpu, Sliders, Terminal, X, AlertTriangle, RefreshCw, Info
} from 'lucide-react';

interface CitationDetails {
  docName: string;
  section: string;
  cosineScore: number;
  snippet: string;
  chunkId: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citation?: CitationDetails;
}

interface VaultDoc {
  id: string;
  name: string;
  size: string;
  tokens: string;
  chunks: number;
  status: 'Indexed' | 'Processing';
  embeddingModel: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'vault' | 'guardrails'>('chat');
  const [input, setInput] = useState('');
  const [selectedCitation, setSelectedCitation] = useState<CitationDetails | null>(null);

  // Guardrail Configuration Sliders
  const [minCosine, setMinCosine] = useState<number>(0.84);
  const [topK, setTopK] = useState<number>(4);
  const [strictAntiHallucination, setStrictAntiHallucination] = useState<boolean>(true);

  // Ingest Simulation State
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [ingestProgress, setIngestProgress] = useState<number>(0);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [simulationMode, setSimulationMode] = useState<'success' | 'failure'>('success');

  const [vaultDocs, setVaultDocs] = useState<VaultDoc[]>([
    { id: '1', name: 'Enterprise_Architecture_Spec_2026.pdf', size: '3.8 MB', tokens: '142,800', chunks: 284, status: 'Indexed', embeddingModel: 'text-embedding-3-large (3072 dims)' },
    { id: '2', name: 'SOC2_Type_II_Security_Controls.docx', size: '1.4 MB', tokens: '64,120', chunks: 128, status: 'Indexed', embeddingModel: 'text-embedding-3-large (3072 dims)' },
    { id: '3', name: 'Stripe_Billing_Webhook_Recovery.md', size: '480 KB', tokens: '22,400', chunks: 48, status: 'Indexed', embeddingModel: 'text-embedding-3-large (3072 dims)' },
    { id: '4', name: 'HIPAA_Compliance_Privacy_Rules.pdf', size: '2.1 MB', tokens: '89,500', chunks: 176, status: 'Indexed', embeddingModel: 'text-embedding-3-large (3072 dims)' },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'init-1',
      role: 'assistant', 
      text: 'Enterprise RAG Engine initialized. Active connection established to PostgreSQL PGVector with HNSW (Hierarchical Navigable Small World) indexing. Query the indexed corporate knowledge base.',
    },
    {
      id: 'init-2',
      role: 'user',
      text: 'How does the architecture ensure fault tolerance and idempotency across Stripe webhooks?',
    },
    {
      id: 'init-3',
      role: 'assistant',
      text: 'The architecture implements an idempotent event bus with Redis streaming cache and exponential backoff retry policies up to 72 hours. Every inbound event is cryptographically verified via HMAC-SHA256 signatures before triggering ledger mutations.',
      citation: {
        docName: 'Stripe_Billing_Webhook_Recovery.md',
        section: '§ 4.2 Idempotent Retry Architecture',
        cosineScore: 0.948,
        chunkId: 'vec_chunk_88a91c',
        snippet: 'All inbound webhooks are deserialized and recorded in the webhook_ledger table with a UNIQUE(stripe_event_id) constraint. If the worker fails, the dispatcher retries after 30s, 2m, 10m, and 1h until full ACK completion.',
      }
    }
  ]);

  const presetQueries = [
    'What is the fault tolerance policy in the Kubernetes cluster?',
    'What encryption requirements does SOC2 mandate for tokens in transit?',
    'How does Stripe handle webhook retry failures for billing events?',
  ];

  const handleSendQuery = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;
    if (!textToSend) setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);

    // Simulated RAG Pipeline Execution
    setTimeout(() => {
      let reply = '';
      let citation: CitationDetails | undefined;

      const q = query.toLowerCase();

      // Determine matching document chunk and raw similarity score
      let candidateDoc = '';
      let candidateSection = '';
      let candidateSnippet = '';
      let candidateChunkId = '';
      let rawCosine = 0.925;
      let detailedReply = '';

      if (q.includes('stripe') || q.includes('webhook') || q.includes('billing')) {
        candidateDoc = 'Stripe_Billing_Webhook_Recovery.md';
        candidateSection = '§ 4.2 Idempotent Retry Architecture & DLQ Routing';
        candidateSnippet = 'All inbound webhooks are deserialized and recorded in the webhook_ledger table with a UNIQUE(stripe_event_id) constraint. If worker processing exhausts 5 exponential retries (up to 72 hours), the unacknowledged payload is automatically routed to a dead-letter queue (DLQ) with an urgent PagerDuty alert.';
        candidateChunkId = 'vec_chunk_88a91c';
        rawCosine = 0.948;
        detailedReply = 'Stripe webhook retry failures are mitigated via an idempotent ledger table storing unique event IDs. When transient network timeouts or 5xx worker exceptions occur, the dispatcher triggers exponential backoff retries at 30s, 2m, 10m, and 1h intervals for up to 72 hours. Persistent failures are automatically isolated into an encrypted dead-letter queue (DLQ) with telemetry alerts.';
      } else if (q.includes('kubernetes') || q.includes('k8s') || q.includes('cluster') || q.includes('fault')) {
        candidateDoc = 'Enterprise_Architecture_Spec_2026.pdf';
        candidateSection = '§ 7.1 High Availability & Multi-AZ Fault Tolerance';
        candidateSnippet = 'The Kubernetes cluster operates with a PodDisruptionBudget of minAvailable: 2 replicas across 3 isolated Availability Zones. Envoy ingress configuration automatically sheds traffic upon latency degradation >200ms across secondary downstream nodes.';
        candidateChunkId = 'vec_chunk_32f01d';
        rawCosine = 0.932;
        detailedReply = 'The Kubernetes cluster enforces high availability through a PodDisruptionBudget maintaining minAvailable: 2 replicas across 3 isolated Availability Zones. Liveness and readiness probes trigger pod drain and restart after 3 consecutive failed checks, while Envoy ingress automatically reroutes traffic away from degraded pods.';
      } else if (q.includes('soc2') || q.includes('encrypt') || q.includes('token') || q.includes('security')) {
        candidateDoc = 'SOC2_Type_II_Security_Controls.docx';
        candidateSection = '§ 3.4 Transport Encryption & Key Management';
        candidateSnippet = 'All data in transit must enforce TLS 1.3 with ECDHE-RSA-AES128-GCM-SHA256 cipher suites. Private signing keys reside inside FIPS 140-2 Level 3 Hardware Security Modules (HSMs) with scheduled 90-day automatic rotation.';
        candidateChunkId = 'vec_chunk_94d21e';
        rawCosine = 0.961;
        detailedReply = 'Under SOC2 Type II CC6.1 controls, all session tokens and API payloads in transit mandate TLS 1.3 with ECDHE-RSA-AES128-GCM-SHA256 cipher suites. Asymmetric keys reside in dedicated FIPS 140-2 Level 3 Hardware Security Modules (HSMs) with automated 90-day key rotations and immutable audit logging.';
      } else if (q.includes('hipaa') || q.includes('privacy') || q.includes('phi') || q.includes('health')) {
        candidateDoc = 'HIPAA_Compliance_Privacy_Rules.pdf';
        candidateSection = '§ 2.8 Protected Health Information (PHI) Access Boundaries';
        candidateSnippet = 'All ePHI data at rest is encrypted using AES-256 with tenant-isolated KMS keys. Role-based access control (RBAC) enforces principle of least privilege, requiring audit log generation for every single read operation on sensitive patient records.';
        candidateChunkId = 'vec_chunk_61b84f';
        rawCosine = 0.918;
        detailedReply = 'HIPAA security mandates field-level AES-256 encryption with per-tenant KMS keys for all Protected Health Information (PHI). Zero-trust access controls enforce ephemeral access tokens, requiring synchronous audit trail generation and automatic session termination after 15 minutes of inactivity.';
      } else {
        candidateDoc = 'Enterprise_Architecture_Spec_2026.pdf';
        candidateSection = '§ 1.2 Data Integrity & Provenance Principles';
        candidateSnippet = 'The RAG architecture utilizes PostgreSQL PGVector with HNSW indexing (m=16, ef_construction=64) over OpenAI text-embedding-3-large embeddings (3072 dimensions). Sampling temperature is locked to 0.0 to neutralize heuristic hallucinations and enforce deterministic retrieval.';
        candidateChunkId = 'vec_chunk_77e43b';
        rawCosine = 0.885;
        detailedReply = `According to § 1.2 of the Enterprise Architecture Specification, the retrieval pipeline leverages PostgreSQL PGVector with HNSW indexing over 3072-dimensional embeddings. Sampling temperature is strictly locked to 0.0, guaranteeing deterministic retrieval without generative extrapolation.`;
      }

      // Check Guardrail Threshold
      if (strictAntiHallucination && rawCosine < minCosine) {
        reply = `[GUARDRAIL TRIGGERED]: Semantic similarity score (${rawCosine.toFixed(3)}) fell below the active threshold (${minCosine.toFixed(2)}). Query execution was halted to prevent speculative generation or unverified extrapolation.`;
        citation = undefined;
      } else {
        reply = detailedReply;
        citation = {
          docName: candidateDoc,
          section: candidateSection,
          cosineScore: rawCosine,
          chunkId: candidateChunkId,
          snippet: candidateSnippet,
        };
      }

      setMessages(prev => [
        ...prev, 
        { id: (Date.now() + 1).toString(), role: 'assistant', text: reply, citation }
      ]);
    }, 700);
  };

  const handleSimulateIngest = (modeOverride?: 'success' | 'failure') => {
    const targetMode = modeOverride || simulationMode;
    setIsIngesting(true);
    setIngestError(null);
    setIngestProgress(15);

    setTimeout(() => setIngestProgress(45), 500);

    if (targetMode === 'failure') {
      setTimeout(() => setIngestProgress(68), 1000);
      setTimeout(() => {
        setIsIngesting(false);
        setIngestError('Ingestion Pipeline Exception: PDF Chunking failed at page 42 (Unparseable OCR byte stream). Retry scheduled via DLQ.');
      }, 1500);
    } else {
      setTimeout(() => setIngestProgress(85), 1100);
      setTimeout(() => {
        setIngestProgress(100);
        setIsIngesting(false);
        const newDoc: VaultDoc = {
          id: Date.now().toString(),
          name: 'Enterprise_Security_Runbook_2026.pdf',
          size: '1.9 MB',
          tokens: '45,200',
          chunks: 92,
          status: 'Indexed',
          embeddingModel: 'text-embedding-3-large (3072 dims)',
        };
        setVaultDocs(prev => [newDoc, ...prev]);
      }, 1600);
    }
  };

  const handleRetryPipeline = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      setIngestError(null);
      setSimulationMode('success');
      handleSimulateIngest('success');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-white">
      
      {/* Top Portfolio Return Bar */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-6 py-2.5 flex items-center justify-between z-40 sticky top-0 backdrop-blur-md">
        <button
          onClick={() => window.location.href = "https://portfolio-axel-nine.vercel.app"}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Master Portfolio</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-400">PostgreSQL PGVector (HNSW) &bull; Zero-Hallucination Guardrails</span>
        </div>
      </div>

      {/* App Header */}
      <header className="border-b border-zinc-800/80 px-6 py-4 bg-zinc-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 shadow-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white">Enterprise RAG Engine</span>
              <span className="text-[10px] font-mono ml-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                PGVector 3072-dim
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800 text-xs font-medium">
            {[
              { id: 'chat', label: 'RAG Playground' },
              { id: 'vault', label: 'Knowledge Vault' },
              { id: 'guardrails', label: 'Guardrails & Parameters' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 space-y-8">
        
        {/* TAB 1: RAG CHAT PLAYGROUND */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            
            {/* Left Chat Area (8 cols) */}
            <div className="lg:col-span-8 flex flex-col h-[650px] rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-2xl">
              
              {/* Chat Sub-Header */}
              <div className="px-6 py-3.5 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Anti-Hallucination Pipeline Active (Temp: 0.0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400">Active Threshold:</span>
                  <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    &ge; {minCosine.toFixed(2)} Cosine
                  </span>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : m.text.startsWith('[GUARDRAIL TRIGGERED]')
                        ? 'bg-amber-950/40 border border-amber-500/40 text-amber-200'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                    }`}>
                      {m.text.startsWith('[GUARDRAIL TRIGGERED]') && (
                        <div className="flex items-center gap-2 mb-2 text-amber-400 font-mono font-bold text-xs">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Strict Guardrail Intercept</span>
                        </div>
                      )}
                      
                      {m.text}

                      {/* Citation Badge */}
                      {m.citation && (
                        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedCitation(m.citation!)}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Source: {m.citation.docName}</span>
                          </button>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Cosine: {m.citation.cosineScore.toFixed(3)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Query Input Box */}
              <div className="p-4 bg-zinc-950/90 border-t border-zinc-800 space-y-3">
                {/* Preset Suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  {presetQueries.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => handleSendQuery(q)}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all text-left truncate max-w-xs"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Enter technical query across indexed enterprise documentation..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase transition-all flex items-center gap-2 shadow-lg"
                  >
                    <span>Query</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>

            {/* Right Side: Source Chunk Inspector / Telemetry (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Citation Detail Box */}
              {selectedCitation ? (
                <div className="p-6 rounded-3xl bg-zinc-900/60 border border-emerald-500/40 space-y-4 shadow-xl animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <span className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Grounded Chunk Inspected
                    </span>
                    <button 
                      onClick={() => setSelectedCitation(null)}
                      className="text-zinc-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-zinc-500 font-mono block text-[10px]">SOURCE DOCUMENT:</span>
                      <span className="font-bold text-white">{selectedCitation.docName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono block text-[10px]">SECTION / HEADING:</span>
                      <span className="text-zinc-300 font-mono">{selectedCitation.section}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono block text-[10px]">VECTOR CHUNK ID:</span>
                      <span className="text-indigo-400 font-mono">{selectedCitation.chunkId}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 leading-relaxed">
                    "{selectedCitation.snippet}"
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800">
                    <span>Cosine Similarity:</span>
                    <span className="text-emerald-400 font-bold">{selectedCitation.cosineScore.toFixed(3)} (Passed Guardrail)</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-4 text-xs">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Embedding Provenance Inspector
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Click on any "Source" link within the assistant's responses to inspect the exact document chunk and vector cosine similarity score used in retrieval.
                  </p>
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-500">
                    // HNSW Search: Top-K = {topK}<br />
                    // Distance Metric: Cosine<br />
                    // Model: text-embedding-3-large
                  </div>
                </div>
              )}

              {/* Quick Knowledge Base Stats */}
              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-3 text-xs">
                <span className="text-zinc-400 font-mono uppercase text-[11px] block">Vector Store Telemetry:</span>
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Indexed Documents:</span>
                    <span className="text-white font-bold">{vaultDocs.length} Manuals</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total Vector Chunks:</span>
                    <span className="text-white font-bold">636 Chunks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">PGVector Index Size:</span>
                    <span className="text-emerald-400 font-bold">14.2 MB</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: DOCUMENT VAULT */}
        {activeTab === 'vault' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Enterprise Knowledge Vault</h2>
                <p className="text-xs text-zinc-400 mt-1">Ingested corporate documentation chunked and tokenized for semantic similarity retrieval.</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Simulation Mode Selector */}
                <div className="flex bg-zinc-900 border border-zinc-800 rounded-full p-1 text-[11px] font-mono">
                  <button
                    onClick={() => {
                      setSimulationMode('success');
                      setIngestError(null);
                    }}
                    className={`px-3 py-1 rounded-full transition-all ${
                      simulationMode === 'success'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Simulate Success
                  </button>
                  <button
                    onClick={() => setSimulationMode('failure')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      simulationMode === 'failure'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Simulate Error
                  </button>
                </div>

                <button
                  onClick={() => handleSimulateIngest()}
                  disabled={isIngesting || isRetrying}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Cpu className="w-4 h-4" />
                  <span>{isIngesting ? 'Processing Embeddings...' : 'Run Ingestion'}</span>
                </button>
              </div>
            </div>

            {/* Ingest Progress Simulation */}
            {isIngesting && (
              <div className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/40 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-emerald-300">
                  <span>Generating Chunks (500 tokens with 50-token overlap) &bull; Vectorizing with OpenAI...</span>
                  <span>{ingestProgress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${ingestProgress}%` }} />
                </div>
              </div>
            )}

            {/* Ingest Error State Banner */}
            {ingestError && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-4 text-xs font-mono text-amber-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{ingestError}</span>
                </div>
                <button
                  onClick={handleRetryPipeline}
                  disabled={isRetrying || isIngesting}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 text-amber-300 border border-amber-500/30 transition-all shrink-0 font-bold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'Retrying...' : 'Retry Pipeline'}</span>
                </button>
              </div>
            )}

            {/* Documents Table */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-500 uppercase text-[11px]">
                  <tr>
                    <th className="p-4">Document</th>
                    <th className="p-4">Size</th>
                    <th className="p-4">Tokens</th>
                    <th className="p-4">Chunks</th>
                    <th className="p-4">Embedding Model</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {vaultDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-zinc-900/50">
                      <td className="p-4 font-semibold text-white flex items-center gap-2 font-sans">
                        <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{doc.name}</span>
                      </td>
                      <td className="p-4 text-zinc-400">{doc.size}</td>
                      <td className="p-4 text-zinc-400">{doc.tokens}</td>
                      <td className="p-4 text-zinc-400">{doc.chunks}</td>
                      <td className="p-4 text-zinc-500 text-[11px]">{doc.embeddingModel}</td>
                      <td className="p-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: GUARDRAILS & PARAMETERS */}
        {activeTab === 'guardrails' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">RAG Pipeline Parameters & Guardrails</h2>
              <p className="text-xs text-zinc-400 mt-1">Calibrate similarity sensitivity and zero-hallucination guardrails across the semantic engine.</p>
            </div>

            <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-8">
              
              {/* Slider: Cosine Threshold */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <label className="text-zinc-300 font-bold uppercase flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Minimum Cosine Similarity Threshold (Min Score)
                  </label>
                  <span className="text-emerald-400 font-bold text-base">{minCosine}</span>
                </div>
                <input
                  type="range"
                  min="0.70"
                  max="0.95"
                  step="0.01"
                  value={minCosine}
                  onChange={(e) => setMinCosine(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Any vector chunk scoring below {minCosine} is discarded. Higher thresholds enforce strict factual grounding.
                </p>
              </div>

              {/* Slider: Top-K Chunks */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <label className="text-zinc-300 font-bold uppercase flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Max Retrieved Context Chunks (Top-K)
                  </label>
                  <span className="text-emerald-400 font-bold text-base">{topK} Chunks</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Number of top-ranked context fragments injected into the final LLM prompt context window.
                </p>
              </div>

              {/* Toggle: Strict Hallucination */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Strict Anti-Hallucination Guardrail</h4>
                  <p className="text-xs text-zinc-400">If no chunks exceed the similarity threshold, refuse speculative generation rather than guessing.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStrictAntiHallucination(!strictAntiHallucination)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    strictAntiHallucination ? 'bg-emerald-600' : 'bg-zinc-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    strictAntiHallucination ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Live Guardrail Impact Telemetry */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400" />
                    <span className="text-zinc-200 font-semibold">Live Guardrail Filter Analysis:</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 pl-6">
                    {minCosine >= 0.94 ? (
                      <span className="text-amber-400 font-bold">
                        High selectivity (&gt;0.94): ~85% of general chunks filtered. Only exact high-cosine matches allowed.
                      </span>
                    ) : minCosine >= 0.85 ? (
                      <span className="text-emerald-400">
                        Balanced enterprise precision (0.85-0.93): Filters out ambiguous noise while preserving relevant facts.
                      </span>
                    ) : (
                      <span className="text-indigo-400">
                        High recall (&lt;0.85): Maximum document coverage with permissive relevance boundary.
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('chat')}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-mono text-[11px] transition-all shrink-0 self-start sm:self-auto"
                >
                  Test in Playground &rarr;
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black py-8 px-6 text-xs text-zinc-500 text-center font-mono">
        Enterprise AI RAG Engine &bull; PostgreSQL PGVector &bull; text-embedding-3-large &bull; Zero-Hallucination Pipeline
      </footer>

    </div>
  );
}
