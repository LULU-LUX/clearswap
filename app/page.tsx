'use client';
import React, { useState, useEffect } from 'react';
import { WagmiConfig, createConfig, useAccount, useBalance } from 'wagmi';
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from 'connectkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { parseUnits, formatUnits } from 'viem';

// --- CONFIGURAÇÃO DA REDE ARC TESTNET ---
const arcTestnet = {
  id: 570,
  name: 'ARC Testnet',
  network: 'arc-testnet',
  nativeCurrency: { decimals: 18, name: 'ARC', symbol: 'ARC' },
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

// --- COMPONENTE INTERNO DA DEX ---
function DexInterface() {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity'>('swap');
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');

  // Busca o saldo real da carteira conectada
  const { data: balance } = useBalance({
    address: address,
    watch: true,
  });

  // Simulação de cálculo de preço (1 USDC = 0.92 EURC)
  useEffect(() => {
    if (sellAmount && !isNaN(Number(sellAmount))) {
      setBuyAmount((Number(sellAmount) * 0.92).toFixed(4));
    } else {
      setBuyAmount('');
    }
  }, [sellAmount]);

  return (
    <div style={{ 
      backgroundColor: '#050505', 
      background: 'radial-gradient(circle at 0% 0%, #1a1a1a 0%, #000 100%)',
      color: '#fff', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      fontFamily: '"Inter", sans-serif' 
    }}>
      
      {/* HEADER / NAVBAR */}
      <nav style={{ width: '100%', maxWidth: '1200px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#00ff88', borderRadius: '8px' }}></div>
          CLEARSWAP
        </div>
        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          <span style={{ color: '#888', cursor: 'pointer', fontSize: '14px' }}>Trade</span>
          <span style={{ color: '#888', cursor: 'pointer', fontSize: '14px' }}>Pool</span>
          <ConnectKitButton />
        </div>
      </nav>

      {/* TABS SELECTOR */}
      <div style={{ marginTop: '60px', marginBottom: '20px', display: 'flex', backgroundColor: '#111', padding: '4px', borderRadius: '16px', border: '1px solid #222' }}>
        <button onClick={() => setActiveTab('swap')} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'swap' ? '#222' : 'transparent', color: activeTab === 'swap' ? '#fff' : '#666', fontWeight: '600', cursor: 'pointer', transition: '0.3s' }}>Swap</button>
        <button onClick={() => setActiveTab('liquidity')} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'liquidity' ? '#222' : 'transparent', color: activeTab === 'liquidity' ? '#fff' : '#666', fontWeight: '600', cursor: 'pointer', transition: '0.3s' }}>Liquidez</button>
      </div>

      {/* MAIN CARD */}
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#111', borderRadius: '32px', padding: '12px', border: '1px solid #222', boxShadow: '0 20px 50px rgba(0,0,0,0.7)' }}>
        
        {activeTab === 'swap' ? (
          <div style={{ padding: '8px' }}>
            {/* Input Venda */}
            <div style={{ backgroundColor: '#1a1a1a', padding: '16px', borderRadius: '24px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '14px', marginBottom: '8px' }}>
                <span>Você vende</span>
                <span>Saldo: {isConnected ? `${Number(balance?.formatted).toFixed(4)} ARC` : '0.0'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: '28px', outline: 'none', width: '60%', fontWeight: '500' }} 
                />
                <button style={{ backgroundColor: '#222', border: '1px solid #333', color: '#fff', padding: '6px 12px', borderRadius: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   ARC <span style={{fontSize: '10px'}}>▼</span>
                </button>
              </div>
            </div>

            {/* Seta de Inversão */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '-16px 0', position: 'relative', zIndex: '2' }}>
              <div style={{ backgroundColor: '#111', border: '4px solid #111', borderRadius: '12px', color: '#00ff88', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              </div>
            </div>

            {/* Input Compra */}
            <div style={{ backgroundColor: '#1a1a1a', padding: '16px', borderRadius: '24px', marginTop: '4px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '14px', marginBottom: '8px' }}>
                <span>Você recebe (estimado)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={buyAmount}
                  readOnly
                  style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '28px', outline: 'none', width: '60%', fontWeight: '500' }} 
                />
                <button style={{ backgroundColor: '#00ff88', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '14px', fontWeight: '600' }}>USDC</button>
              </div>
            </div>
          </div>
        ) : (
          /* ABA LIQUIDEZ */
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px', color: '#888' }}>Forneça liquidez para ganhar 0.3% em todas as transações.</div>
            <button style={{ width: '100%', padding: '16px', borderRadius: '20px', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>+ Criar nova Pool</button>
            <div style={{ border: '1px dashed #333', padding: '40px 20px', borderRadius: '24px', color: '#444' }}>Suas pools aparecerão aqui</div>
          </div>
        )}

        {/* BOTÃO DE AÇÃO */}
        <div style={{ padding: '8px' }}>
          <ConnectKitButton.Custom>
            {({ isConnected, show }) => {
              if (!isConnected) return (
                <button onClick={show} style={{ width: '100%', padding: '20px', borderRadius: '24px', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>Conectar Carteira</button>
              );
              return (
                <button style={{ 
                  width: '100%', 
                  padding: '20px', 
                  borderRadius: '24px', 
                  border: 'none', 
                  backgroundColor: sellAmount ? '#00ff88' : '#222', 
                  color: sellAmount ? '#000' : '#555', 
                  fontWeight: 'bold', 
                  cursor: sellAmount ? 'pointer' : 'not-allowed', 
                  fontSize: '1.1rem',
                  transition: '0.3s'
                }}>
                  {sellAmount ? 'Confirmar Swap' : 'Insira um valor'}
                </button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>
      </div>

      <footer style={{ marginTop: 'auto', padding: '40px', color: '#222', fontSize: '12px', fontWeight: 'bold' }}>
        CLEARSWAP PROTOCOL • POWERED BY ARC
      </footer>
    </div>
  );
}

// --- WRAPPER DE PROVIDERS ---
export default function ClearSwap() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="dark">
          <DexInterface />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
