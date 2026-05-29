export function Skeleton(props: { className?: string; rounded?: 'md' | 'xl' | '2xl' }) {
  const r = props.rounded ?? 'xl'
  const radius = r === '2xl' ? 'rounded-2xl' : r === 'xl' ? 'rounded-xl' : 'rounded-md'
  return (
    <div
      className={[
        'relative overflow-hidden bg-slate-100',
        radius,
        props.className ?? '',
        'before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent',
        'before:animate-[shimmer_1.1s_infinite]',
      ].join(' ')}
    />
  )
}

