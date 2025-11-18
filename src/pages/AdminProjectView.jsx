import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api_base_url } from '../helper';
import AdminProjectSkeleton from '../components/skeletons/AdminProjectSkeleton';

export default function AdminProjectView(){
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [proj, setProj] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    let cancel=false;
    const run = async()=>{
      setLoading(true); setError('');
      try {
        const token = localStorage.getItem('adminToken');
        const headers = token ? { 'x-admin-token': token } : {};
        const res = await fetch(`${api_base_url}/api/admin/projects/${projectId}`, { headers, credentials:'include'});
        const json = await res.json();
        if(res.status===401){ navigate('/admin/login'); return; }
        if(!json.success) setError(json.message||'Failed'); else if(!cancel) setProj(json.project);
      } catch { if(!cancel) setError('Network error'); }
      finally { if(!cancel) setLoading(false);} }
    run();
    return ()=>{ cancel=true };
  },[projectId,navigate]);

  const copy = (text)=>{ try { navigator.clipboard.writeText(text); } catch {} };

  return (
    <div className="min-h-screen p-4 md:p-6 text-white">
      <button onClick={()=>navigate(-1)} className="mb-4 px-3 py-1.5 rounded bg-dark-700 hover:bg-dark-600 text-xs border border-dark-500">← Back</button>
  {loading && <AdminProjectSkeleton />}
      {error && <div className="text-sm bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded mb-4">{error}</div>}
      {proj && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">{proj.title || 'Untitled Project'}</h1>
              <p className="text-xs text-dark-300 mt-1">Language: {proj.language}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['htmlCode','cssCode','jsCode','code'].map(k=> proj[k] ? (
                <button key={k} onClick={()=>copy(proj[k])} className="px-2 py-1 bg-dark-700 hover:bg-dark-600 rounded text-xs border border-dark-600">Copy {k.replace('Code','').toUpperCase()}</button>
              ) : null)}
            </div>
          </div>
          {/* Output / Preview (read-only) */}
          <div className="rounded-2xl bg-dark-800/60 border border-dark-600 overflow-hidden">
            <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-dark-300 border-b border-dark-600">Output / Preview</div>
            <div className="p-3">
              {proj.language === 'web' ? (
                <div className="rounded-lg overflow-hidden bg-white text-black">
                  <iframe
                    title="preview"
                    className="w-full h-[360px] md:h-[480px]"
                    srcDoc={`<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><style>${proj.cssCode||''}</style></head><body>${proj.htmlCode||''}<script>${proj.jsCode||''}<\/script></body></html>`}
                  />
                </div>
              ) : (
                <pre className="text-primary-200/90 text-xs whitespace-pre-wrap leading-relaxed">
                  {proj.output || 'No output saved'}
                </pre>
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {proj.htmlCode && <CodeBlock label="HTML" code={proj.htmlCode} />}
            {proj.cssCode && <CodeBlock label="CSS" code={proj.cssCode} />}
            {proj.jsCode && <CodeBlock label="JS" code={proj.jsCode} />}
            {proj.code && <CodeBlock label="Code" code={proj.code} />}
          </div>
        </div>
      )}
    </div>
  );
}

function CodeBlock({ label, code }){
  return (
    <div className="rounded-xl overflow-hidden border border-dark-600 bg-dark-800/60 flex flex-col">
      <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-dark-300 border-b border-dark-600">{label}</div>
      <pre className="p-3 text-xs whitespace-pre-wrap leading-relaxed font-mono text-primary-200/90">{code}</pre>
    </div>
  );
}
