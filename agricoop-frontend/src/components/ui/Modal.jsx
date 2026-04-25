import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  // Fermer avec Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const widths = { sm: '380px', md: '520px', lg: '680px' }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in" style={{ width: widths[size] }}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
