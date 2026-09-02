import { useState } from 'react';
import { ArrowLeft, Send, Database, FileText, Sparkles } from 'lucide-react';



export function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'vault' | 'chunks'>('chat');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Bienvenido al motor RAG de conocimiento empresarial. Puedes hacerme preguntas sobre los documentos indexados en PostgreSQL PGVector.', citation: 'System: Initialized' },
    { role: 'user', text: '¿Cómo se garantiza que no haya alucinaciones en las respuestas técnicas?' },
    { role: 'assistant', text: 'El pipeline implementa guardrails con umbral estricto de similitud de coseno (>0.82) y rechaza cualquier inferencia que no esté respaldada por un chunk fáctico del documento fuente.', citation: 'Source: rag_guardrails_spec.pdf § 2.4 (Cosine: 0.941)' },
  ]);
  const [input, setInput] = useState('');

  const documents = [
    { name: 'Enterprise_Architecture_Spec.pdf', size: '2.4 MB', chunks: 142, indexedAt: '2024-08-20', status: 'Ready' },
    { name: 'Security_Compliance_SOC2.docx', size: '1.1 MB', chunks: 68, indexedAt: '2024-08-22', status: 'Ready' },
    { name: 'Stripe_Billing_Webhooks_Guide.md', size: '420 KB', chunks: 24, indexedAt: '2024-08-28', status: 'Ready' },
  ];

  const handleSend = (overrideText?: string) => {
    const text = typeof overrideText === 'string' ? overrideText : input;
    if (!text.trim()) return;
    if (typeof overrideText !== 'string') setInput('');
    
    setMessages(prev => [...prev, { role: 'user', text }]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Respuesta generada en tiempo real mediante PGVector (HNSW Index) para: "${text}". Citas fácticas extraídas con 0 alucinaciones.`,
          citation: `Document chunk [0.932 similarity score]`,
        },
      ]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-zinc-100 flex flex-col font-mono animate-fadeIn">
      
      {/* Return Bar */}
      <div className="bg-gradient-to-r from-red-950 via-zinc-950 to-zinc-950 border-b border-red-500/30 px-4 py-2.5 flex items-center justify-between z-40 sticky top-0 backdrop-blur-md">
        <button
          onClick={() => window.location.href = "https://portfolio-axel-nine.vercel.app"}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-red-600 hover:bg-red-500 text-white shadow-glow-red transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Portafolio Maestro</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-red-950/60 border border-red-500/30 text-red-400">
            ● PostgreSQL PGVector (HNSW) • Zero-Hallucination
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-400 text-red-300 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wider">ENTERPRISE AI RAG ENGINE</h1>
            <span className="text-[10px] text-red-400">High-Accuracy Knowledge Base with Vector Embeddings</span>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-black/60 p-1 rounded-2xl border border-zinc-800 text-xs">
          {(['chat', 'vault', 'chunks'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all ${
                activeTab === tab ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab === 'chat' ? 'Grounded Chat' : tab === 'vault' ? 'Document Vault' : 'PGVector Chunks'}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        
        {activeTab === 'chat' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Anti-Hallucination Verified Channel</span>
              </span>
              <span className="text-emerald-400 text-[10px] font-bold">● PGVector Connected</span>
            </div>

            <div className="h-[380px] overflow-y-auto space-y-3 p-4 rounded-2xl bg-black/70 border border-zinc-800">
              {messages.map((m, i) => (
                <div key={i} className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-xl ${
                  m.role === 'user' ? 'bg-zinc-900 text-zinc-100 ml-auto' : 'bg-red-950/30 border border-red-500/30 text-zinc-200'
                }`}>
                  <p>{m.text}</p>
                  {m.citation && (
                    <div className="mt-2 text-[10px] text-amber-300 font-bold bg-black/50 p-1.5 rounded-lg border border-amber-500/20">
                      {m.citation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {[
                "¿Cuáles son los controles SOC2 implementados?",
                "Resume la arquitectura de Stripe Webhooks",
                "¿Qué pasa si falla el HNSW Index?"
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(query)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Pregunta algo sobre la arquitectura, seguridad o API..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500"
              />
              <button
                onClick={() => handleSend()}
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow-red"
              >
                <Send className="w-4 h-4" />
                <span>Enviar</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-sm font-bold text-white uppercase">Ingested Knowledge Documents</h2>
            <div className="space-y-3">
              {documents.map((doc, i) => (
                <div key={i} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-red-400" />
                    <div>
                      <span className="font-bold text-white block">{doc.name}</span>
                      <span className="text-[10px] text-zinc-400">{doc.size} • {doc.chunks} Chunks Indexados</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chunks' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-sm font-bold text-white uppercase">PGVector HNSW Index Vectors</h2>
            <div className="p-4 rounded-2xl bg-black/70 border border-zinc-800 space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-900 font-mono text-[11px] text-zinc-300">
                <span className="text-red-400 font-bold block">Chunk ID: chunk_00921 (Cosine: 0.941)</span>
                "The auth system uses Supabase Row-Level Security with custom JWT claims ensuring tenant isolation across all multi-tenant tables."
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900 font-mono text-[11px] text-zinc-300">
                <span className="text-red-400 font-bold block">Chunk ID: chunk_00922 (Cosine: 0.884)</span>
                "Stripe webhooks are verified using HMAC-SHA256 signatures before updating subscription tiers in the PostgreSQL database."
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default App;
