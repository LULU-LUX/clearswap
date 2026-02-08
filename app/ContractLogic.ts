import { ethers } from 'ethers';

export const executarSwapContrato = async (tokenA: string, tokenB: string, amount: string, slippage: string) => {
    try {
        const { ethereum } = window as any;
        if (!ethereum) return window.alert("Instale a MetaMask!");

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008";
        
        const ERC20_ABI = [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function allowance(address owner, address spender) public view returns (uint256)"
        ];
        
        const ROUTER_ABI = [
            "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
        ];

        const tokenContrato = new ethers.Contract(tokenA, ERC20_ABI, signer);
        const routerContrato = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
        
        const valorWei = ethers.utils.parseUnits(amount || "0", 18);

        // --- CHECAGEM DE ALLOWANCE ---
        console.log("Checando permissão...");
        const allowance = await tokenContrato.allowance(userAddress, ROUTER_ADDRESS);
        
        if (allowance.lt(valorWei)) {
            window.alert("Passo 1: Autorizando Gasto...");
            const txApprove = await tokenContrato.approve(ROUTER_ADDRESS, valorWei);
            console.log("Approve enviado:", txApprove.hash);
            window.alert("Approve enviado! Aguarde 5 segundos e clique em Swap novamente se o próximo passo não abrir.");
            await txApprove.wait(1); 
            // Após o approve, vamos tentar disparar o swap automaticamente
        }

        // --- EXECUÇÃO DO SWAP ---
        console.log("Iniciando Passo 2: Swap");
        window.alert("Passo 2: Confirmando a Troca (Swap)...");
        
        const path = [tokenA, tokenB];
        const deadline = Math.floor(Date.now() / 1000) + 600; 

        const txSwap = await routerContrato.swapExactTokensForTokens(
            valorWei,
            0, 
            path,
            userAddress,
            deadline,
            { 
                gasLimit: 500000, // Aumentei o limite para garantir
                gasPrice: await provider.getGasPrice() // Força o preço do gás da rede
            }
        );

        window.alert("SWAP ENVIADO! Hash: " + txSwap.hash);
        await txSwap.wait();
        window.alert("🔥 SUCESSO TOTAL! Tokens trocados.");

    } catch (error: any) {
        console.error("ERRO DETALHADO:", error);
        window.alert("ERRO NO PROCESSO: " + (error.reason || error.message || "Erro desconhecido"));
    }
};

export const adicionarLiquidezContrato = (tokenA: string, tokenB: string, amountA: string, amountB: string) => {};