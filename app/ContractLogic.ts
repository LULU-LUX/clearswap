import { ethers } from 'ethers';

export const executarSwapContrato = async (tokenA: string, tokenB: string, amount: string, slippage: string) => {
  // Se esse alerta não aparecer, o problema é a conexão do botão no page.tsx
  window.alert("Iniciando processo de Swap...");

  try {
    const { ethereum } = window as any;
    if (!ethereum) return window.alert("MetaMask não detectada!");

    const provider = new ethers.providers.Web3Provider(ethereum);
    // Força a abertura da MetaMask para garantir conexão ativa
    await provider.send("eth_requestAccounts", []);
    
    const signer = provider.getSigner();
    const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008";
    
    // ABI simplificada
    const ERC20_ABI = ["function approve(address spender, uint256 amount) public returns (bool)"];
    const contrato = new ethers.Contract(tokenA, ERC20_ABI, signer);

    // Ajuste de valor (considerando 18 decimais)
    const valorWei = ethers.utils.parseUnits(amount || "0", 18);

    window.alert("Assine o APPROVE na MetaMask agora!");
    const tx = await contrato.approve(ROUTER_ADDRESS, valorWei);
    
    window.alert("Enviado! Hash: " + tx.hash);
    await tx.wait();
    window.alert("Sucesso total!");

  } catch (error: any) {
    console.error(error);
    window.alert("Erro: " + (error.message || "A transação falhou"));
  }
};

export const adicionarLiquidezContrato = (tokenA: any, tokenB: any, aA: any, aB: any) => {
    window.alert("Liquidez acionada!");
};