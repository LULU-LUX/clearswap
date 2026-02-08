import { ethers } from 'ethers';

export const executarSwapContrato = async (tokenA: string, tokenB: string, amount: string, slippage: string) => {
    // Alerta para você saber que o clique funcionou
    window.alert("Acionando MetaMask diretamente...");

    try {
        // Pega o provider direto do navegador, ignorando o socket do WalletConnect
        const provider = new (ethers.providers as any).Web3Provider((window as any).ethereum);
        
        // Força o navegador a focar na conta da MetaMask
        await provider.send("eth_requestAccounts", []);
        
        const signer = provider.getSigner();
        const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008";
        
        // ABI mínima para o Approve
        const ERC20_ABI = ["function approve(address spender, uint256 amount) public returns (bool)"];
        
        const contrato = new ethers.Contract(tokenA, ERC20_ABI, signer);
        const valorWei = ethers.utils.parseUnits(amount || "0", 18);

        window.alert("Abra sua MetaMask para confirmar o Approve!");
        
        const tx = await contrato.approve(ROUTER_ADDRESS, valorWei);
        
        window.alert("Transação enviada! Hash: " + tx.hash);
        await tx.wait();
        window.alert("Sucesso! Token aprovado.");

    } catch (error: any) {
        console.error("ERRO:", error);
        // Filtra o erro chato do evmAsk para te mostrar o erro real
        const msgErro = error.message || "Erro de conexão com a carteira";
        window.alert("Atenção: " + msgErro);
    }
};

export const adicionarLiquidezContrato = (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
    window.alert("Liquidez em breve!");
};