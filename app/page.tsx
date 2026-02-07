'use client';
import React, { useState, useEffect } from 'react';
import { WagmiConfig, createConfig, useAccount, useBalance, useSwitchChain, useChainId } from 'wagmi';
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

const TOKEN_LIST = [
  { symbol: 'USDC', address: '0x3600000000000000000000000000000000000000', decimals: 18 },
  { symbol: 'EURC', address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a', decimals: 18 },
];

function DexInterface() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const [sellToken, setSellToken] = useState(TOKEN_LIST[0]);
  const [buyToken, setBuyToken] = useState(TOKEN_LIST[1]);
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [showModal, setShowModal] = useState<'sell' | 'buy' | null>(null);

  const isWrongNetwork = isConnected && chainId !== arcTestnet.id;

  // Busca saldo do token selecionado
  const { data: balance, isLoading } = useBalance({
    address: address,
    token: sellToken.address as `0x${string}`,
  });

  useEffect(() => {
    if (sellAmount && !isNaN(Number(sellAmount))) {
      // Simulação simples de taxa de câmbio
      setBuyAmount((Number(sellAmount) * 0.92).toFixed(4));
    } else {
      setBuyAmount('');
    }
  }, [sellAmount, sellToken, buyToken]);

  const switchTokens = () => {
    const temp = sellToken;
    setSellToken(buyToken);
    setBuyToken(temp);
    setSellAmount('');
  };

  return (
    <div style={{ backgroundColor: '#050505', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif' }}>
      
      {/* NAVBAR */}
      <nav style={{ width: '100%', maxWidth: '1200px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#00ff88' }}>CLEARSWAP</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isConnected && (
            <div 
              onClick={() => isWrongNetwork && switchChain?.({ chainId: arcTestnet.id })}
              style={{ 
                cursor: isWrongNetwork ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isWrongNetwork ? '#ff4444' : '#00ff8822',
                padding: '8px 12px',
                borderRadius: '12px',
                border: `1px solid ${isWrongNetwork ? '#ff4444' : '#00ff88'}`,
                color: isWrongNetwork ? '#fff' : '#00ff88',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {isWrongNetwork ? '⚠️ Mudar para ARC' : '🌐 ARC Testnet'}
            </div>
          )}
          <ConnectKitButton />
        </div>
      </nav>

      {/* CARD DE SWAP */}
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#111', borderRadius: '28px', padding: '20px', border: '1px solid #222', marginTop: '100px', position: 'relative' }}>
        
        <div style={{ backgroundColor: '#1a1a1a', padding: '16px', borderRadius: '20px', border: '1px solid #222' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '13px', marginBottom: '10px' }}>
            <span>Você vende</span>
            <span>Saldo: {isConnected ? (isLoading ? '...' : `${Number(balance?.formatted || 0).toFixed(4)}`) : '0.0'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input type="number" placeholder="0.0" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', outline: 'none', width: '50%' }} />
            <button onClick={() => setShowModal('sell')} style={{ backgroundColor: '#222', padding: '8px 12px', borderRadius: '12px', border: '1px solid #333', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              {sellToken.symbol} ▾
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', margin: '-15px 0', position: 'relative', zIndex: 2 }}>
          <button onClick={switchTokens} style={{ backgroundColor: '#111', border: '4px solid #050505', borderRadius: '12px', padding: '8px', cursor: 'pointer', color: '#00ff88' }}>⇅</button>
        </div>

        <div style={{ backgroundColor: '#1a1a1a', padding: '16px', borderRadius: '20px', border: '1px solid #222', marginBottom: '20px' }}>
          <div style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>Você recebe</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input type="number" placeholder="0.0" value={buyAmount} readOnly style={{ background: 'none', border: 'none', color: '#00ff88', fontSize: '24px', outline: 'none', width: '50%' }} />
            <button onClick={() => setShowModal('buy')} style={{ backgroundColor: '#222', padding: '8px 12px', borderRadius: '12px', border: '1px solid #333', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              {buyToken.symbol} ▾
            </button>
          </div>
        </div>

        <ConnectKitButton.Custom>
          {({ isConnected, show }) => (
            <button 
              disabled={isWrongNetwork && isConnected}
              onClick={isConnected ? undefined : show} 
              style={{ 
                width: '100%', padding: '18px', borderRadius: '18px', border: 'none', 
                backgroundColor: (isWrongNetwork && isConnected) ? '#333' : (isConnected ? (sellAmount ? '#00ff88' : '#222') : '#fff'), 
                color: '#000', fontWeight: 'bold', 
                cursor: (isWrongNetwork && isConnected) ? 'not-allowed' : 'pointer' 
              }}>
              {isWrongNetwork && isConnected ? 'Rede Incorreta' : (isConnected ? (sellAmount ? 'Confirmar Swap' : 'Insira um valor') : 'Conectar Carteira')}
            </button>
          )}
        </ConnectKitButton.Custom>

        {/* MODAL DE SELEÇÃO */}
        {showModal && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#111', borderRadius: '28px', padding: '20px', zIndex: 10, border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontWeight: 'bold' }}>Selecionar Token</span>
              <button onClick={() => setShowModal(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
            </div>
            {TOKEN_LIST.map((token) => (
              <div key={token.symbol} onClick={() => {
                if (showModal === 'sell') setSellToken(token);
                else setBuyToken(token);
                setShowModal(null);
              }} style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #222', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>{token.symbol}</span>
                <span style={{ fontSize: '10px', color: '#555' }}>{token.address.slice(0, 10)}...</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
