'use client';
import React, { useState, useEffect } from 'react';
import { WagmiConfig, createConfig, useAccount, useBalance } from 'wagmi';
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from 'connectkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ==========================================================
// CHAMADA DO ARQUIVO 2 (LOGICA DE CONTRATOS)
// Quando terminarmos, basta copiar o conteúdo do arquivo 2 aqui.
import { executarSwapContrato, adicionarLiquidezContrato } from './ContractLogic';
// ==========================================================
// CHAMADA DO ARQUIVO 3 (LOGICA DE POOLS)
import { adicionarLiquidez, calcularValorAutomatico } from './PoolLogic';

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
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'swap' | 'pool'>('swap');
  
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]);
  const [tokenB, setTokenB] = useState(TOKEN_LIST[1]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'A' | 'B'>('A');

  const [amount, setAmount] = useState('');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [slippage, setSlippage] = useState('3');
  const [showPreview, setShowPreview] = useState(false); 
  const [receiveAmount, setReceiveAmount] = useState('0');

  useEffect(() => { setMounted(true); }, []);

  const { data: balA } = useBalance({ address, token: tokenA.address });
  const { data: balB } = useBalance({ address, token: tokenB.address });

  const handleAmountChange = (val: string, setter: (v: string) => void) => {
    if (Number(val) < 0) return;
    setter(val);
  };

  const updatePoolB = async (val: string) => {
    const formatado = val.replace(',', '.'); 
    if (Number(formatado) < 0) return;
    setAmountA(formatado);
    if (!formatado || Number(formatado) <= 0) { setAmountB(''); return; }
    const resultado = await calcularValorAutomatico(formatado, tokenA.address, tokenB.address);
    // A mágica está aqui: .replace(',', '.') no final
    setAmountB(resultado.toString().replace(',', '.')); 
  };

  const updatePoolA = async (val: string) => {
    const formatado = val.replace(',', '.'); 
    if (Number(formatado) < 0) return;
    setAmountB(formatado);
    if (!formatado || Number(formatado) <= 0) { setAmountA(''); return; }
    const resultado = await calcularValorAutomatico(formatado, tokenB.address, tokenA.address);
    // A mágica está aqui também
    setAmountA(resultado.toString().replace(',', '.')); 
  };

  useEffect(() => {
    const atualizarSwap = async () => {
      if (activeTab === 'swap' && amount && Number(amount) > 0) {
        const res = await calcularValorAutomatico(amount, tokenA.address, tokenB.address);
        setReceiveAmount(res);
      } else {
        setReceiveAmount('0');
      }
    };
    atualizarSwap();
  }, [amount, tokenA, tokenB, activeTab]);

  const openModal = (target: 'A' | 'B') => {
    setSelectingFor(target);
    setIsModalOpen(true);
  };


  // FUNÇÕES QUE CHAMAM O ARQUIVO 2
  const clicarNoBotaoSwap = () => {
    executarSwapContrato(tokenA.address, tokenB.address, amount, slippage);
  };

  const clicarNoBotaoPool = () => {
    adicionarLiquidez(tokenA.address, tokenB.address, amountA, amountB);
  };

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: '#050505', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      
      <nav style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#00ff88' }}>CLEARSWAP <span style={{color: '#fff', fontSize: '12px'}}>PRO</span></div>
        <ConnectKitButton />
      </nav>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#111', padding: '10px 20px', borderRadius: '12px', border: '1px solid #222' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>Slippage:</span>
        {[0.5, 1, 3].map((s) => (
          <button key={s} onClick={() => setSlippage(s.toString())} style={{ backgroundColor: slippage === s.toString() ? '#00ff88' : '#222', border: 'none', color: slippage === s.toString() ? '#000' : '#fff', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>{s}%</button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#222', borderRadius: '8px', padding: '2px 8px', border: '1px solid #333' }}>
          <input 
            type="number" 
            value={slippage} 
            onChange={(e) => setSlippage(e.target.value)} 
            style={{ width: '40px', background: 'none', border: 'none', color: '#00ff88', outline: 'none', textAlign: 'right', fontWeight: 'bold' }}
          />
          <span style={{ color: '#00ff88', fontSize: '12px', marginLeft: '2px' }}>%</span>
        </div>
      </div>

      <div style={{ display: 'flex', backgroundColor: '#111', padding: '6px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #222' }}>
        <button onClick={() => setActiveTab('swap')} style={{ padding: '12px 35px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'swap' ? '#222' : 'transparent', color: activeTab === 'swap' ? '#00ff88' : '#888', cursor: 'pointer', fontWeight: 'bold' }}>SWAP</button>
        <button onClick={() => setActiveTab('pool')} style={{ padding: '12px 35px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'pool' ? '#222' : 'transparent', color: activeTab === 'pool' ? '#00ff88' : '#888', cursor: 'pointer', fontWeight: 'bold' }}>POOLS</button>
      </div>

      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#111', borderRadius: '32px', padding: '24px', border: '1px solid #222', position: 'relative' }}>
        
        {activeTab === 'swap' ? (
          <>
            <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '20px', marginBottom: '8px', border: '1px solid #222' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '12px', marginBottom: '10px' }}>
                <span>Você vende</span><span>Saldo: {balA?.formatted.slice(0,6) || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input type="text" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value.replace(',', '.'))} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '28px', outline: 'none', width: '60%' }} />
                <button onClick={() => openModal('A')} style={{ backgroundColor: '#222', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>{tokenA.symbol} ▼</button>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', margin: '-18px 0', zIndex: 2, position: 'relative' }}>
               <button onClick={() => {const t = tokenA; setTokenA(tokenB); setTokenB(t);}} style={{ backgroundColor: '#111', border: '4px solid #050505', borderRadius: '12px', color: '#00ff88', cursor: 'pointer', padding: '8px', fontSize: '18px' }}>⇅</button>
            </div>

            <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #222', marginTop: '10px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '12px', marginBottom: '10px' }}>
                <span>Você recebe</span><span>Saldo: {balB?.formatted.slice(0,6) || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input type="text" readOnly value={receiveAmount === '0' ? '0.0' : Number(receiveAmount).toLocaleString('en-US', {minimumFractionDigits: 6, maximumFractionDigits: 6})} style={{ background: 'none', border: 'none', color: '#00ff88', fontSize: '28px', outline: 'none', width: '60%' }} />
                <button onClick={() => openModal('B')} style={{ backgroundColor: '#222', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>{tokenB.symbol} ▼</button>
              </div>
            </div>

            <ConnectKitButton.Custom>
              {({ isConnected, show }) => {
                return (
                  <button 
                    onClick={() => {
                      if (!isConnected) {
                        show?.(); 
                      } else {
                        clicarNoBotaoSwap(); 
                      }
                    }} 
                    disabled={isConnected && !amount} 
                    style={{ 
                      width: '100%', 
                      padding: '20px', 
                      borderRadius: '20px', 
                      border: 'none', 
                      backgroundColor: (!isConnected || amount) ? '#00ff88' : '#222', 
                      color: '#000', 
                      fontWeight: '900', 
                      fontSize: '16px', 
                      cursor: 'pointer' 
                    }}
                  >
                    {!isConnected ? 'CONECTAR CARTEIRA' : 'SWAP'}
                  </button>
                );
              }}
            </ConnectKitButton.Custom>
          </>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#00ff88' }}>Pool de Liquidez V2</h3>
            
            <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '20px', marginBottom: '8px', border: '1px solid #222' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '12px', marginBottom: '10px' }}>
                <span>Quantidade {tokenA.symbol}</span><span>Saldo: {balA?.formatted.slice(0,6) || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={amountA} 
                  onChange={(e) => updatePoolB(e.target.value)} 
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', outline: 'none', width: '60%' }} 
                />
                <button onClick={() => openModal('A')} style={{ backgroundColor: '#222', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>{tokenA.symbol} ▼</button>
              </div>
            </div>

            <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '20px', marginBottom: '10px', border: '1px solid #222' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '12px', marginBottom: '10px' }}>
                <span>Quantidade {tokenB.symbol}</span><span>Saldo: {balB?.formatted.slice(0,6) || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={amountB} 
                  onChange={(e) => updatePoolA(e.target.value)} 
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', outline: 'none', width: '60%' }} 
                />
                <button onClick={() => openModal('B')} style={{ backgroundColor: '#222', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>{tokenB.symbol} ▼</button>
              </div>
            </div>

            <ConnectKitButton.Custom>
              {({ isConnected, show }) => (
                <button 
                  onClick={() => !isConnected ? show?.() : setShowPreview(true)} 
                  disabled={isConnected && (!amountA || !amountB)} 
                  style={{ 
                    width: '100%', 
                    padding: '20px', 
                    borderRadius: '20px', 
                    border: 'none', 
                    marginTop: '20px',
                    backgroundColor: (isConnected && (!amountA || !amountB)) ? '#222' : '#00ff88', 
                    color: '#000', 
                    fontWeight: '900', 
                    fontSize: '16px', 
                    cursor: (isConnected && (!amountA || !amountB)) ? 'not-allowed' : 'pointer' 
                  }}
                >
                  {!isConnected ? 'CONECTAR CARTEIRA' : 'ADICIONAR LIQUIDEZ'}
                </button>
              )}
            </ConnectKitButton.Custom>

            {showPreview && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#111', borderRadius: '32px', zIndex: 20, padding: '24px', border: '1px solid #00ff88', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: '#00ff88', marginTop: 0 }}>Confirmar Liquidez</h3>
                <div style={{ flex: 1, backgroundColor: '#1a1a1a', borderRadius: '16px', padding: '15px', marginBottom: '20px' }}>
                  <p style={{ color: '#888', fontSize: '12px', margin: '0' }}>Você deposita:</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', margin: '10px 0' }}>
                    <span>{amountA} {tokenA.symbol}</span>
                    <span>+</span>
                    <span>{amountB} {tokenB.symbol}</span>
                  </div>
                  <hr style={{ border: '0.5px solid #333', margin: '15px 0' }} />
                  <p style={{ color: '#888', fontSize: '12px', margin: '0' }}>LP Tokens Estimados:</p>
                  <div style={{ fontSize: '22px', color: '#00ff88', fontWeight: 'bold' }}>
                    {(Math.sqrt(Number(amountA) * Number(amountB)) || 0).toFixed(6)} LP
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowPreview(false)} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Voltar</button>
                  <button onClick={() => { setShowPreview(false); clicarNoBotaoPool(); }} style={{ flex: 2, padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#00ff88', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar</button>
                </div>
              </div>
            )}
          </div>
        )}  

        {isModalOpen && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#111', borderRadius: '32px', zIndex: 10, padding: '20px', border: '1px solid #00ff88' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><span style={{ fontWeight: 'bold' }}>Tokens</span><button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button></div>
            {TOKEN_LIST.map((t) => (
              <div key={t.address} onClick={() => { if(selectingFor==='A') setTokenA(t); else setTokenB(t); setIsModalOpen(false); }} style={{ padding: '15px', borderRadius: '15px', backgroundColor: '#1a1a1a', marginBottom: '10px', cursor: 'pointer', border: '1px solid #222' }}>{t.symbol}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WagmiConfig config={config}><QueryClientProvider client={queryClient}><ConnectKitProvider mode="dark"><DexApp /></ConnectKitProvider></QueryClientProvider></WagmiConfig>
  );
}