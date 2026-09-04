import { useState } from 'react';
import { 
  ArrowLeft, Send, Database, FileText, Sparkles, ShieldCheck, 
  Cpu, Sliders, Terminal, X
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
      text: 'Motor RAG Empresarial inicializado. Conexión activa a PostgreSQL PGVector con indexación HNSW (Hierarchical Navigable Small World). Haga una consulta sobre los documentos corporativos indexados.',
    },
    {
      id: 'init-2',
      role: 'user',
      text: '¿Cómo se garantiza la tolerancia a fallos y la resiliencia en los webhooks de Stripe?',
    },
    {
      id: 'init-3',
      role: 'assistant',
      text: 'El sistema implementa un bus de eventos idempotente con almacenamiento intermedio en Redis y reintentos exponenciales automáticos de hasta 72 horas. Cada evento entrante se valida con la firma criptográfica HMAC-SHA256 antes de procesar cualquier mutación en el balance.',
      citation: {
        docName: 'Stripe_Billing_Webhook_Recovery.md',
        section: '§ 4.2 Arquitectura Idempotente de Reintentos',
        cosineScore: 0.948,
        chunkId: 'vec_chunk_88a91c',
        snippet: 'Todos los webhooks entrantes son deserializados y registrados en la tabla webhook_ledger con constraint UNIQUE(stripe_event_id). Si el worker falla, el dispatcher reintenta tras 30s, 2m, 10m y 1h hasta completar el ACK.',
      }
    }
  ]);

  const presetQueries = [
    '¿Cuál es la política de tolerancia a fallos en el clúster Kubernetes?',
    '¿Qué requisitos de cifrado exige SOC2 para tokens en tránsito?',
    '¿Cómo maneja Stripe los fallos de reintento en webhooks de facturación?',
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

      if (query.toLowerCase().includes('kubernetes') || query.toLowerCase().includes('fallos')) {
        reply = 'El clúster Kubernetes opera con un PodDisruptionBudget de minAvailable: 2 réplicas a través de 3 Availability Zones aisladas. Las sondas de liveness y readiness están calibradas con umbral de fallo de 3 reintentos consecutivos antes de drenar el pod.';
        citation = {
          docName: 'Enterprise_Architecture_Spec_2026.pdf',
          section: '§ 7.1 Alta Disponibilidad & Tolerancia Multi-AZ',
          cosineScore: 0.932,
          chunkId: 'vec_chunk_32f01d',
          snippet: 'La configuración de ingress de Envoy redirige automáticamente el tráfico ante degradación de latencia >200ms en cualquiera de los nodos secundarios.',
        };
      } else if (query.toLowerCase().includes('soc2') || query.toLowerCase().includes('cifrado')) {
        reply = 'Bajo el control SOC2 CC6.1, todos los datos en tránsito deben forzar TLS 1.3 con suites de cifrado ECDHE-RSA-AES128-GCM-SHA256. Queda estrictamente prohibido el uso de certificados autofirmados en entornos accesibles por red.';
        citation = {
          docName: 'SOC2_Type_II_Security_Controls.docx',
          section: '§ 3.4 Cifrado de Canales y Gestión de Claves',
          cosineScore: 0.961,
          chunkId: 'vec_chunk_94d21e',
          snippet: 'Todas las claves privadas residen en HSM FIPS 140-2 Nivel 3 con rotación programada cada 90 días naturales.',
        };
      } else {
        reply = `Respuesta fundamentada mediante búsqueda de similitud PGVector (${(minCosine + 0.08).toFixed(3)} Cosine) en base de conocimiento enterprise. Cero inferencias no respaldadas por documentos.`;
        citation = {
          docName: 'Enterprise_Architecture_Spec_2026.pdf',
          section: '§ 1.2 Principios de Integridad de Datos',
          cosineScore: 0.914,
          chunkId: 'vec_chunk_77e43b',
          snippet: 'El modelo RAG tiene restringida la temperatura a 0.0 para neutralizar alucinaciones heurísticas.',
        };
      }

      setMessages(prev => [
        ...prev, 
        { id: (Date.now() + 1).toString(), role: 'assistant', text: reply, citation }
      ]);
    }, 700);
  };

  const handleSimulateIngest = () => {
    setIsIngesting(true);
    setIngestProgress(15);
    setTimeout(() => setIngestProgress(55), 600);
    setTimeout(() => setIngestProgress(85), 1200);
    setTimeout(() => {
      setIngestProgress(100);
      setIsIngesting(false);
      const newDoc: VaultDoc = {
        id: Date.now().toString(),
        name: 'Nuevo_Manual_Operaciones_2026.pdf',
        size: '1.9 MB',
        tokens: '45,200',
        chunks: 92,
        status: 'Indexed',
        embeddingModel: 'text-embedding-3-large (3072 dims)',
      };
      setVaultDocs(prev => [newDoc, ...prev]);
    }, 1800);
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
          <span>Volver al Portafolio Maestro</span>
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
              { id: 'chat', label: 'Playground RAG' },
              { id: 'vault', label: 'Bóveda de Documentos' },
              { id: 'guardrails', label: 'Parámetros & Guardrails' },
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
                  <span>Canal Anti-Alucinación Activo (Temp: 0.0)</span>
                </div>
                <span className="text-[11px] text-zinc-500">Umbral Coseno: &gt;{minCosine}</span>
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
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                    }`}>
                      {m.text}

                      {/* Citation Badge */}
                      {m.citation && (
                        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedCitation(m.citation!)}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Fuente: {m.citation.docName}</span>
                          </button>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Coseno: {m.citation.cosineScore}
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
                    placeholder="Escriba su consulta técnica sobre los documentos indexados..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase transition-all flex items-center gap-2 shadow-lg"
                  >
                    <span>Consultar</span>
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
                      Chunk Fáctico Inspeccionado
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
                      <span className="text-zinc-500 font-mono block text-[10px]">DOCUMENTO MATRIZ:</span>
                      <span className="font-bold text-white">{selectedCitation.docName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono block text-[10px]">SECCIÓN / PÁRRAFO:</span>
                      <span className="text-zinc-300 font-mono">{selectedCitation.section}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono block text-[10px]">VECTOR ID:</span>
                      <span className="text-indigo-400 font-mono">{selectedCitation.chunkId}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 leading-relaxed">
                    "{selectedCitation.snippet}"
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800">
                    <span>Similitud Coseno:</span>
                    <span className="text-emerald-400 font-bold">{selectedCitation.cosineScore} (Criterio Aprobado)</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-4 text-xs">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Inspección de Embeddings
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Haga clic en cualquier enlace de "Fuente" dentro de las respuestas del asistente para inspeccionar el fragmento exacto y el score de similitud vectorial utilizado en la inferencia.
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
                <span className="text-zinc-400 font-mono uppercase text-[11px] block">Resumen del Almacén Vectorial:</span>
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Documentos Indexados:</span>
                    <span className="text-white font-bold">{vaultDocs.length} Manuales</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Chunks Totales:</span>
                    <span className="text-white font-bold">636 Chunks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Espacio en PGVector:</span>
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
                <h2 className="text-2xl font-bold text-white tracking-tight">Bóveda de Documentos Indexados</h2>
                <p className="text-xs text-zinc-400 mt-1">Manuales corporativos procesados y tokenizados para búsqueda semántica.</p>
              </div>

              <button
                onClick={handleSimulateIngest}
                disabled={isIngesting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md"
              >
                <Cpu className="w-4 h-4" />
                <span>{isIngesting ? 'Procesando Embeddings...' : 'Simular Ingesta de Documento'}</span>
              </button>
            </div>

            {/* Ingest Progress Simulation */}
            {isIngesting && (
              <div className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/40 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-emerald-300">
                  <span>Generando Chunks (500 tokens con overlap de 50) &bull; Vectorizando con OpenAI...</span>
                  <span>{ingestProgress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${ingestProgress}%` }} />
                </div>
              </div>
            )}

            {/* Documents Table */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-500 uppercase text-[11px]">
                  <tr>
                    <th className="p-4">Documento</th>
                    <th className="p-4">Tamaño</th>
                    <th className="p-4">Tokens</th>
                    <th className="p-4">Chunks</th>
                    <th className="p-4">Modelo Embedding</th>
                    <th className="p-4 text-right">Estado</th>
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
              <h2 className="text-2xl font-bold text-white tracking-tight">Parámetros del Pipeline RAG</h2>
              <p className="text-xs text-zinc-400 mt-1">Calibre la sensibilidad y los filtros anti-alucinación del motor semántico.</p>
            </div>

            <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-8">
              
              {/* Slider: Cosine Threshold */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <label className="text-zinc-300 font-bold uppercase flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Umbral Mínimo de Similitud Coseno (Min Score)
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
                  Cualquier chunk con un score menor a {minCosine} será descartado de forma estricta. Valores más altos garantizan mayor precisión fáctica.
                </p>
              </div>

              {/* Slider: Top-K Chunks */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <label className="text-zinc-300 font-bold uppercase flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Máximo de Chunks Recuperados (Top-K)
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
                  Número de fragmentos contextuales inyectados en el prompt final del LLM.
                </p>
              </div>

              {/* Toggle: Strict Hallucination */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Guardrail Anti-Alucinación Estricto</h4>
                  <p className="text-xs text-zinc-400">Si ningún chunk supera el umbral de similitud, rechazar la respuesta en lugar de conjeturar.</p>
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
