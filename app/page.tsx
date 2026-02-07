'use client';
import React from 'react';
import { WagmiConfig, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains'; // O erro estava aqui, corrigido!
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from 'connectkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = createConfig(
  getDefaultConfig({
    appName: 'ClearSwap',
    chains: [mainnet], // Depois adicionaremos a ARC aqui
    walletConnectProjectId: 'b5e5b30646c0326e63241f8742e85e2b',
  }),
);

const queryClient = new QueryClient();

export default function ClearSwap() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="dark">
          <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
            
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>ClearSwap</h1>
            <p style={{ color: '#888', marginBottom: '30px' }}>ARC Testnet DEX</p>

            <div style={{ backgroundColor: '#111', padding: '25px', borderRadius: '20px', border: '1px solid #333', width: '380px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#aaa' }}>Você envia</label>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#000', borderRadius: '12px', marginTop: '5px' }}>
                  <input type="number" placeholder="0.0" style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '1.2rem', width: '70%' }} />
                  <span style={{ fontWeight: 'bold' }}>USDC</span>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '12px', color: '#aaa' }}>Você recebe</label>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#000', borderRadius: '12px', marginTop: '5px' }}>
                  <input type="number" placeholder="0.0" style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '1.2rem', width: '70%' }} />
                  <span style={{ fontWeight: 'bold' }}>EURC</span>
                </div>
              </div>

              <ConnectKitButton.Custom>
                {({ isConnected, show, truncatedAddress, ensName }) => {
                  return (
                    <button onClick={show} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                      {isConnected ? (ensName ?? truncatedAddress) : "Conectar Carteira"}
                    </button>
                  );
                }}
              </ConnectKitButton.Custom>
            </div>

            <p style={{ marginTop: '20px', color: '#444', fontSize: '12px' }}>ClearSwap Protocol v1.0</p>
          </div>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
