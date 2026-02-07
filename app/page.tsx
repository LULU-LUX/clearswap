'use client';
import React from 'react';
import { WagmiConfig, createConfig } from 'wagmi';
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from 'connectkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Configuração da Rede ARC Testnet
const arcTestnet = {
  id: 570, 
  name: 'ARC Testnet',
  network: 'arc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ARC',
    symbol: 'ARC',
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.arc.io'] },
    public: { http: ['https://rpc-testnet.arc.io'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://explorer-testnet.arc.io' },
  },
  testnet: true,
};

const config = createConfig(
  getDefaultConfig({
    appName: 'ClearSwap',
    chains: [arcTestnet],
    walletConnectProjectId: 'b5e5b30646c0326e63241f8742e85e2b',
  }),
);

const queryClient = new QueryClient();

export default function ClearSwap() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <div style={{ 
            backgroundColor: '#000', 
            color: '#fff', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontFamily: 'sans-serif' 
          }}>
            
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>ClearSwap</h1>
            <p style={{ color: '#888', marginBottom: '30px' }}>ARC Testnet DEX</p>

            <div style={{ 
              backgroundColor: '#111', 
              padding: '25px', 
              borderRadius: '20px', 
              border: '1px solid #333', 
              width: '380px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              
              {/* Seção Enviar */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', color: '#aaa', marginLeft: '5px' }}>Você envia</label>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '15px', 
                  backgroundColor: '#000', 
                  borderRadius: '12px', 
                  marginTop: '5px',
                  border: '1px solid #222'
                }}>
                  <input type="number" placeholder="0.0" style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '1.2rem', width: '70%' }} />
                  <span style={{ fontWeight: 'bold', color: '#fff' }}>USDC</span>
                </div>
              </div>

              {/* Ícone de Seta (Visual) */}
              <div style={{ textAlign: 'center', marginBottom: '10px', color: '#555' }}>↓</div>

              {/* Seção Receber */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '12px', color: '#aaa', marginLeft: '5px' }}>Você recebe</label>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '15px', 
                  backgroundColor: '#000', 
                  borderRadius: '12px', 
                  marginTop: '5px',
                  border: '1px solid #222'
                }}>
                  <input type="number" placeholder="0.0" style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '1.2rem', width: '70%' }} />
                  <span style={{ fontWeight: 'bold', color: '#fff' }}>EURC</span>
                </div>
              </div>

              {/* Botão de Conexão e Ação */}
              <ConnectKitButton.Custom>
                {({ isConnected, show, truncatedAddress, ensName }) => {
                  if (!isConnected) {
                    return (
                      <button onClick={show} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                        Conectar Carteira
                      </button>
                    );
                  }
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#222', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                        Fazer Swap
                      </button>
                      <button onClick={show} style={{ background: '#1a1a1a', border: '1px solid #333', padding: '8px', borderRadius: '8px', color: '#888', cursor: 'pointer', fontSize: '12px', transition: '0.2s' }}>
                        👤 {ensName ?? truncatedAddress} (Clique para Sair)
                      </button>
                    </div>
                  );
                }}
              </ConnectKitButton.Custom>

            </div>

            <p style={{ marginTop: '20px', color: '#444', fontSize: '12px' }}>ClearSwap Protocol v1.1 • ARC Testnet</p>
          </div>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
