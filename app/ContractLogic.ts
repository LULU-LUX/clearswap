import { ethers } from 'ethers';

const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008"; 

export const executarSwapContrato = async (tokenA: string, tokenB: string, amount: string, slippage: string) => {
    window.alert("Iniciando Swap na Vercel...");

    try {
        if (typeof window === "undefined" || !(window as any).ethereum) {
            return window.alert("MetaMask não encontrada!");
        }

        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        
        // Solicita as contas para garantir que a MetaMask acorde
        await provider.send("eth_requestAccounts", []);
        
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        window.alert("Conectado com: " + userAddress);

        const ERC20_ABI = [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function decimals() public view returns (uint8)"
        ];
        
        const tokenContrato = new ethers.Contract(tokenA, ERC20_ABI, signer);
        
        // Pegar decimais ou usar 18 se falhar
        const decimals = await tokenContrato.decimals().catch(() => 18);
        const valorWei = ethers.utils.parseUnits(amount || "0", decimals);
        
        window.alert("Passo Final: Abra a MetaMask para o APPROVE!");

        const tx = await tokenContrato.approve(ROUTER_ADDRESS, valorWei);
        
        window.alert("Transação enviada! Hash: " + tx.hash);
        await tx.wait();
        window.alert("SUCESSO: Token Liberado!");

    } catch (error: any) {
        console.error("Erro detalhado:", error);
        window.alert("ERRO: " + (error.message || "Falha na conexão"));
    }
};

export const adicionarLiquidezContrato = (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
    console.log("Liquidez acionada");
};