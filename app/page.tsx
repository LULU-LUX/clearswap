'use client';
import React, { useState, useEffect } from 'react';
import { WagmiConfig, createConfig, useAccount, useBalance, useSwitchChain, useChainId } from 'wagmi';
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from 'connectkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- CONFIGURAÇÃO ARC TESTNET ---
const arcTestnet = {
  id: 5042002,
  name: 'ARC Testnet',
  network: 'arc-testnet',
  nativeCurrency: { decimals: 18, name: 'USDC', symbol: 'USDC' },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
    public: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: { default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' } },
  testnet: true,
};

const config = createConfig(
  getDefaultConfig({
    appName: 'ClearSwap Pro',
    chains: [arcTestnet],
    walletConnectProjectId: 'b5e5b30646c0326e63241f8742e85e2b',
  }),
);

const queryClient = new QueryClient();

const TOKEN_LIST = [
  { symbol: 'USDC', address: '0x3600000000000000000000000000000000000000' as `0x${string}` },
  { symbol: 'EURC', address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a' as `0x${string}` },
];

function DexApp() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'swap' | 'pool'>('swap');
  
  // States para Swap
  const [sellToken, setSellToken] = useState(TOKEN_LIST[0]);
  const [buyToken, setBuyToken] = useState(TOKEN_LIST[1]);
  const [amount, setAmount] = useState('');

  // States para Pool
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]);
  const [tokenB, setTokenB] = useState(TOKEN_LIST[1]);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const isWrongNetwork = isConnected && chainId !== 5042002;

  // Busca de Saldo (Polling de 4s para evitar sumiço no refresh)
  const { data: balA, refetch: refetchA } = useBalance({ address, token: activeTab === 'swap' ? sellToken.address : tokenA.address, chainId: 5042002 });
  const { data: balB, refetch: refetchB } = useBalance({ address, token: activeTab === 'swap' ? buyToken.address : tokenB.address, chainId: 5042002 });

  useEffect(() => {
    if (isConnected && address && mounted) {
      const timer = setInterval(() => { refetchA(); refetchB(); }, 4000);
      return () => clearInterval(timer);
    }
  }, [isConnected, address, sellToken, tokenA, mounted, refetchA, refetchB]);

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: '#050505', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <nav style={{ width: '100%', maxWidth: '1200px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#00ff88', letterSpacing: '-1px' }}>CLEARSWAP</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isWrongNetwork && (
            <button onClick={() => switchChain?.({ chainId: 5042002 })} style={{ backgroundColor: '#ff4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Switch to ARC</button>
          )}
          <ConnectKitButton />
        </div>
      </nav>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', backgroundColor: '#111', padding: '4px', borderRadius: '16px', margin: '40px 0 20px 0', border: '1px solid #222' }}>
        {['swap', 'pool'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{ 
              padding: '10px 30px', borderRadius: '12px', border: 'none', 
              backgroundColor: activeTab === tab ? '#222' : 'transparent', 
              color: activeTab === tab ? '#00ff88' : '#888', 
              cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' 
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Card Principal */}
      <div style={{ width: '100%', maxWidth: '460px', backgroundColor: '#111', borderRadius: '32px', padding: '24px', border: '1px solid #222', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        
        {activeTab === 'swap' ? (
          <div id="swap-ui">
            <div style={{ marginBottom: '10px', fontSize: '14px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
              <span>Vender</span>
              <span>Saldo: {balA?.formatted.slice(0,6) || '0.00'}</span>
            </div>
            <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '20px', border: '1px solid #222', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <input type="number" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '28px', outline: 'none', width: '60%' }} />
                <button style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '12px', fontWeight: 'bold' }}>{sellToken.symbol}</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '-18px 0', zIndex: 2, position: 'relative' }}>
              <button onClick={() => {setSellToken(buyToken); setBuyToken(sellToken);}} style={{ backgroundColor: '#111', border: '4px solid #050505', borderRadius: '12px', color: '#00ff88', padding: '8px', cursor: 'pointer' }}>⇅</button>
            </div>

            <div style={{ marginTop: '10px', marginBottom: '10px', fontSize: '14px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
              <span>Receber (estimado)</span>
              <span>Saldo: {balB?.formatted.slice(0,6) || '0.00'}</span>
            </div>
            <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '20px', border: '1px solid #222', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <input type="text" readOnly value={amount ? (Number(amount) * 0.997).toFixed(4) : ''} placeholder="0.0" style={{ background: 'none', border: 'none', color: '#00ff88', fontSize: '28px', outline: 'none', width: '60%' }} />
                <button style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '12px', fontWeight: 'bold' }}>{buyToken.symbol}</button>
              </div>
            </div>
          </div>
        ) : (
          <div id="pool-ui">
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Adicionar Liquidez</h3>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>Receba taxas de LP ao fornecer ativos para a pool.</p>
            
            <div style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '18px', border: '1px solid #222', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <input type="number" placeholder="0.0" value={amountA} onChange={(e) => setAmountA(e.target.value)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', outline: 'none', width: '50%' }} />
                <span style={{ color: '#888' }}>{tokenA.symbol}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '5px', color: '#888' }}>+</div>

            <div style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '18px', border: '1px solid #222', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <input type="number" placeholder="0.0" value={amountB} onChange={(e) => setAmountB(e.target.value)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', outline: 'none', width: '50%' }} />
                <span style={{ color: '#888' }}>{tokenB.symbol}</span>
              </div>
            </div>
          </div>
        )}

        <button 
          disabled={!isConnected}
          style={{ 
            width: '100%', padding: '20px', borderRadius: '20px', border: 'none', 
            backgroundColor: isConnected ? '#00ff88' : '#222', 
            color: '#000', fontWeight: '900', fontSize: '16px', cursor: 'pointer',
            opacity: isConnected ? 1 : 0.6
          }}
        >
          {isConnected ? (activeTab === 'swap' ? 'EXECUTAR SWAP' : 'SUPPLY LIQUIDITY') : 'CONECTAR CARTEIRA'}
        </button>

      </div>

      {/* Footer Info */}
      <div style={{ marginTop: '30px', color: '#444', fontSize: '12px' }}>
        ARC Testnet ID: 5042002 | Protocolo v2 Full-Range
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="dark">
          <DexApp />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
