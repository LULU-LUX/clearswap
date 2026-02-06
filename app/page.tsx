import React from 'react';

export default function ClearSwap() {
  return (
    <div style={{ backgroundColor: '#000', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <img src="https://via.placeholder.com/150" alt="ClearSwap Logo" style={{ marginBottom: '20px' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>ClearSwap</h1>
      <p style={{ color: '#888' }}>Conectado à ARC Testnet</p>
      
      <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #333', width: '350px', marginTop: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>Enviar</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#000', borderRadius: '10px', marginTop: '5px' }}>
            <input type="number" placeholder="0.0" style={{ background: 'none', border: 'none', color: '#fff', outline: 'none' }} />
            <span>USDC</span>
          </div>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Receber</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#000', borderRadius: '10px', marginTop: '5px' }}>
            <input type="number" placeholder="0.0" style={{ background: 'none', border: 'none', color: '#fff', outline: 'none' }} />
            <span>EURC</span>
          </div>
        </div>
        <button style={{ width: '100%', padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
          Conectar Carteira
        </button>
      </div>
    </div>
  );
}
