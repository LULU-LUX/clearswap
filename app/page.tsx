'use client';
import React, { useState, useEffect } from 'react';
import { WagmiConfig, createConfig, useAccount, useBalance } from 'wagmi';
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from 'connectkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

// --- INTERFACE DA DEX ---
function DexInterface() {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity'>('swap');
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');

  const { data: balance } = useBalance({
    address: address,
  });

  useEffect(() => {
    if (sellAmount && !isNaN(Number(sellAmount))) {
      setBuyAmount((Number(sellAmount) * 0.92).toFixed(4));
    } else {
      setBuyAmount('');
    }
  }, [sellAmount]);

  return (
    <div style={{ backgroundColor: '#050505', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif' }}>
      
      {/* NAVBAR */}
      <nav style={{ width: '100%', maxWidth: '1200px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#00ff88' }}>
          CLEAR<span style={{color: '#fff'}}>SWAP</span>
        </div>
        <ConnectKitButton />
      </nav>

      {/* TABS */}
      <div style={{ marginTop: '60px', marginBottom: '20px', display: 'flex', backgroundColor: '#111', padding: '5px', borderRadius: '16px', border: '1px solid #222' }}>
        <button 
          onClick={() => setActiveTab('swap')}
          style={{ padding: '10px 25px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'swap' ? '#222' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
        >Swap</button>
        <button 
          onClick={() => setActiveTab('liquidity')}
          style={{ padding: '10px 25px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'liquidity' ? '#222' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
        >Liquidez</button>
      </div>

      {/* DEX CARD */}
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#111', borderRadius: '28px', padding: '20px', border: '1px solid #222' }}>
        {activeTab === 'swap' ? (
          <>
            <div style={{ backgroundColor: '#1a1a1a', padding: '16px', borderRadius: '20px', border: '1px solid #222' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '13px', marginBottom: '10px' }}>
                <span>Você vende</span>
                <span>Saldo: {isConnected ? `${Number(balance?.formatted || 0).toFixed(4)} ARC` : '0.0'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', outline: 'none', width: '60%' }} 
                />
                <div style={{ backgroundColor: '#222', padding: '6px 12px', borderRadius: '12px', fontWeight: 'bold' }}>ARC</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '-12px 0', position: 'relative', zIndex: 2, color: '#00ff88' }}>↓</div>

            <div style={{ backgroundColor: '#1a1a1a', padding: '16px', borderRadius: '20px', border: '1px solid #222', marginBottom: '20px' }}>
              <div style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>Você recebe</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={buyAmount}
                  readOnly
                  style={{ background: 'none', border: 'none', color: '#00ff88', fontSize: '24px', outline: 'none', width: '60%' }} 
                />
                <div style={{ backgroundColor: '#222', padding: '6px 12px', borderRadius: '12px', fontWeight: 'bold' }}>USDC</div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: '#888' }}>Área de Liquidez</div>
        )}

        <ConnectKitButton.Custom>
          {({ isConnected, show }) => (
            <button 
              onClick={isConnected ? undefined : show} 
              style={{ width: '100%', padding: '18px', borderRadius: '18px', border: 'none', backgroundColor: isConnected ? (sellAmount ? '#00ff88' : '#222') : '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
              {isConnected ? (sellAmount ? 'Confirmar Swap' : 'Insira um valor') : 'Conectar Carteira'}
            </button>
          )}
        </ConnectKitButton.Custom>
      </div>
    </div>
  );
}

// --- PROVIDERS (Corrigido para evitar erro de tipo no Vercel) ---
export default function ClearSwap() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="dark">
          <DexInterface />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
