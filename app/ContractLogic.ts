import { ethers } from 'ethers';

const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008"; 

export const executarSwapContrato = async (tokenA: string, tokenB: string, amount: string, slippage: string) => {
    // 1. Confirmação que os dados chegaram
    window.alert("DADOS RECEBIDOS:\nToken: " + tokenA + "\nValor: " + amount);

    try {
        const { ethereum } = window as any;
        if (!ethereum) {
            return window.alert("ERRO: Instale a MetaMask!");
        }

        // 2. Criar Provider e pedir conexão explicitamente
        const provider = new ethers.providers.Web3Provider(ethereum);
        
        window.alert("Solicitando permissão da MetaMask...");
        await provider.send("eth_requestAccounts", []);
        
        const signer = provider.getSigner();

        // 3. Configurar o Contrato do Token
        const ERC20_ABI = [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function decimals() public view returns (uint8)"
        ];
        
        const tokenContrato = new ethers.Contract(tokenA, ERC20_ABI, signer);
        
        // 4. Converter valor (usando 18 como padrão)
        const valorWei = ethers.utils.parseUnits(amount || "0", 18);
        
        window.alert("Último passo: Assine o APPROVE na MetaMask!");

        // 5. CHAMADA REAL DA CARTEIRA
        const tx = await tokenContrato.approve(ROUTER_ADDRESS, valorWei);
        
        window.alert("TRANSASÇÃO ENVIADA!\nHash: " + tx.hash);
        await tx.wait();
        window.alert("SUCESSO: Token liberado.");

    } catch (error: any) {
        console.error("ERRO:", error);
        window.alert("ERRO NO PROCESSO:\n" + (error.message || "Erro desconhecido"));
    }
};

export const adicionarLiquidezContrato = (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
    window.alert("Liquidez!");
};