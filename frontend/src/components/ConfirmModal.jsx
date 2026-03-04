import React from 'react';
import ReactDOM from 'react-dom';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, hideCancel = false, type = 'warning', confirmText, children }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        if (type === 'success') return '✅';
        if (type === 'error') return '❌';
        return '⚠️';
    };

    const getButtonColor = () => {
        if (type === 'success') return 'var(--primary)';
        if (type === 'error' || type === 'warning') return '#ff3232';
        return 'var(--primary)';
    };

    const modalContent = (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(20px)',
            padding: '20px',
        }}>
            <div className="glass-panel animate-fade-in" style={{
                padding: '40px',
                width: '100%',
                maxWidth: '480px',
                border: '1px solid var(--card-border)',
                textAlign: 'center',
                background: 'var(--navbar-bg)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                borderRadius: '24px',
            }}>
                <div style={{ fontSize: '52px', marginBottom: '20px' }}>{getIcon()}</div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '15px', color: 'var(--text-main)' }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: children ? '20px' : '35px', fontSize: '15px', lineHeight: '1.7' }}>{message}</p>

                {children && <div style={{ marginBottom: '30px' }}>{children}</div>}

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    {!hideCancel && (
                        <button
                            onClick={onCancel}
                            style={{
                                flex: 1, padding: '14px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-main)', border: '1px solid var(--card-border)',
                                fontWeight: 700, fontSize: '15px', cursor: 'pointer',
                            }}
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1, padding: '14px', borderRadius: '12px',
                            background: getButtonColor(),
                            color: 'white', border: 'none', fontWeight: 800, fontSize: '15px',
                            cursor: 'pointer',
                            boxShadow: `0 8px 20px ${type === 'success' ? 'var(--primary-glow)' : 'rgba(255,50,50,0.3)'}`,
                        }}
                    >
                        {confirmText || (hideCancel ? (type === 'success' ? 'Aceptar' : 'Entendido') : 'Confirmar')}
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default ConfirmModal;
