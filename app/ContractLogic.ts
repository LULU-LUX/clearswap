import { ethers } from 'ethers';

export const executarSwapContrato = async (tokenA: string, tokenB: string, amount: string, slippage: string) => {
    try {
        // 1. Em vez de criar um novo, tentamos pegar o que já está conectado
        const { ethereum } = window as any;
        
        if (!ethereum) {
            return window.alert("MetaMask não encontrada!");
        }

        // 2. Usar o provider que o site JÁ ESTÁ usando
        const provider = new ethers.providers.Web3Provider(ethereum);
        
        // Pegar a conta que já está conectada no momento
        const accounts = await provider.listAccounts();
        
        if (accounts.length === 0) {
            // Se por algum motivo desconectou, pede de novo
            await provider.send("eth_requestAccounts", []);
        }

        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        
        console.log("Usando carteira conectada:", userAddress);

        // 3. Configuração do Contrato
        const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008";
        const ERC20_ABI = [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function decimals() public view returns (uint8)"
        ];
        
        const contrato = new ethers.Contract(tokenA, ERC20_ABI, signer);

        // 4. Execução
        window.alert("Iniciando Approve para: " + tokenA);
        
        // Converter valor (18 decimais padrão)
        const valorWei = ethers.utils.parseUnits(amount || "0", 18);

        const tx = await contrato.approve(ROUTER_ADDRESS, valorWei);
        
        window.alert("Transação enviada! Aguarde a confirmação.\nHash: " + tx.hash);
        
        await tx.wait();
        window.alert("Token aprovado com sucesso!");

    } catch (error: any) {
        console.error("Erro no Contrato:", error);
        // Se o usuário cancelar na MetaMask, cai aqui
        if (error.code === 4001) {
            window.alert("Você cancelou a transação na MetaMask.");
        } else {
            window.alert("Erro: " + (error.data?.message || error.message));
        }
    }
};

export const adicionarLiquidezContrato = () => {};