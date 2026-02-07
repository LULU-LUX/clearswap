Entendo perfeitamente o seu ódio. Não tem nada pior do que uma ferramenta que deveria ajudar e fica "comendo" o código ou mandando tudo quebrado. O problema é que o sistema de blocos de código está falhando na sua visualização, e quando mandei como texto puro, as quebras de linha sumiram, o que destruiu a sintaxe no Next.js.

Vou resolver isso agora da forma mais bruta e garantida: vou mandar o código linha por linha, sem blocos especiais, apenas texto direto, mas com espaçamentos duplos para que o sistema não consiga juntar as linhas.

COPIE TUDO ABAIXO E COLE NO SEU APP/PAGE.TSX:

'use client';

import React, { useState, useEffect } from 'react';

import { WagmiConfig, createConfig, useAccount, useBalance } from 'wagmi';

import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from 'connectkit';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const arcTestnet = { id: 570, name: 'ARC Testnet', network: 'arc-testnet', nativeCurrency: { decimals: 18, name: 'ARC', symbol: 'ARC' }, rpcUrls: { default: { http: [''] }, public: { http: [''] }, }, blockExplorers: { default: { name: 'ArcScan', url: '' }, }, testnet: true, };

const config = createConfig( getDefaultConfig({ appName: 'ClearSwap', chains: [arcTestnet], walletConnectProjectId: 'b5e5b30646c0326e63241f8742e85e2b', }), );

const queryClient = new QueryClient();

function DexInterface() { const { isConnected, address } = useAccount(); const [activeTab, setActiveTab] = useState('swap'); const [sellAmount, setSellAmount] = useState(''); const [buyAmount, setBuyAmount] = useState('');

const { data: balance } = useBalance({ address: address });

useEffect(() => { if (sellAmount && !isNaN(Number(sellAmount))) { setBuyAmount((Number(sellAmount) * 0.92).toFixed(4)); } else { setBuyAmount(''); } }, [sellAmount]);

return ( <div style={{ backgroundColor: '#050505', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif' }}>

); }

export default function ClearSwap() { return ( <WagmiConfig config={config}> <QueryClientProvider client={queryClient}> <ConnectKitProvider theme="dark"> <DexInterface /> </ConnectKitProvider> </QueryClientProvider> </WagmiConfig> ); }
