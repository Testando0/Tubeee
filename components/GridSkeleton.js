export default function GridSkeleton({ count = 10 }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div className="sk" style={{ aspectRatio: '16/9' }} />
          <div style={{ padding: '10px 12px 13px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div className="sk" style={{ height: 13, width: '88%' }} />
            <div className="sk" style={{ height: 12, width: '55%' }} />
            <div className="sk" style={{ height: 11, width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
