'use client'; import React, { useState, useEffect } from 'react'; import { WagmiConfig, createConfig, useAccount, useBalance } from 'wagmi'; import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from 'connectkit'; import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const arcTestnet = { id: 570, name: 'ARC Testnet', network: 'arc-testnet', nativeCurrency: { decimals: 18, name: 'ARC', symbol: 'ARC' }, rpcUrls: { default: { http: [''] }, public: { http: [''] }, }, blockExplorers: { default: { name: 'ArcScan', url: '' }, }, testnet: true, };

const config = createConfig( getDefaultConfig({ appName: 'ClearSwap', chains: [arcTestnet], walletConnectProjectId: 'b5e5b30646c0326e63241f8742e85e2b', }), );

const queryClient = new QueryClient();

function DexInterface() { const { isConnected, address } = useAccount(); const [activeTab, setActiveTab] = useState('swap'); const [sellAmount, setSellAmount] = useState(''); const [buyAmount, setBuyAmount] = useState('');

const { data: balance } = useBalance({ address: address });

useEffect(() => { if (sellAmount && !isNaN(Number(sellAmount))) { setBuyAmount((Number(sellAmount) * 0.92).toFixed(4)); } else { setBuyAmount(''); } }, [sellAmount]);

return ( <div style={{ backgroundColor: '#050505', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif' }}> <nav style={{ width: '100%', maxWidth: '1200px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#00ff88' }}>CLEARSWAP</div> <ConnectKitButton /> </nav>

); }

export default function ClearSwap() { return ( <WagmiConfig config={config}> <QueryClientProvider client={queryClient}> <ConnectKitProvider theme="dark"> <DexInterface /> </ConnectKitProvider> </QueryClientProvider> </WagmiConfig> ); }
