import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, hideCancel = false }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 100001, backdropFilter: 'blur(20px)',
            padding: '20px'
        }}>
            <div className="glass-panel animate-fade-in" style={{
                padding: '40px', width: '100%', maxWidth: '450px',
                border: '1px solid var(--card-border)', textAlign: 'center',
                background: 'var(--navbar-bg)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>{hideCancel ? '❌' : '⚠️'}</div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '15px' }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '35px', fontSize: '16px', lineHeight: '1.6' }}>{message}</p>

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    {!hideCancel && (
                        <button
                            onClick={onCancel}
                            style={{
                                flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                                color: 'white', border: '1px solid var(--card-border)', fontWeight: 700, fontSize: '15px'
                            }}
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1, padding: '14px', borderRadius: '12px', background: hideCancel ? 'var(--primary)' : '#ff3232',
                            color: 'white', border: 'none', fontWeight: 800, fontSize: '15px',
                            boxShadow: hideCancel ? '0 8px 20px var(--primary-glow)' : '0 8px 20px rgba(255,50,50,0.3)'
                        }}
                    >
                        {hideCancel ? 'Entendido' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
