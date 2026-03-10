export default function GridSkeleton({ n = 10 }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-subtle)', background: 'var(--obs-900)' }}>
          <div className="sk" style={{ aspectRatio: '16/9', borderRadius: 0 }} />
          <div style={{ padding: '10px 12px 13px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div className="sk" style={{ height: 12, width: '85%' }} />
            <div className="sk" style={{ height: 11, width: '50%' }} />
            <div className="sk" style={{ height: 10, width: '38%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
