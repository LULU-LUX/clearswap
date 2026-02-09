import { ethers } from 'ethers';

const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008";

// ABI focada no que o SwapRouter02 da Synthra realmente usa
const ROUTER_ABI = [
    "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to) external payable returns (uint256 amountOut)",
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)",
    "function decimals() public view returns (uint8)"
];

export const gerenciarLiquidez = async (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);

        // 1. Pegar decimais dinamicamente (para não enviar 1000000 errado de novo)
        const contratoA = new ethers.Contract(tokenA, ERC20_ABI, signer);
        const contratoB = new ethers.Contract(tokenB, ERC20_ABI, signer);
        
        const [decA, decB] = await Promise.all([
            contratoA.decimals().catch(() => 18),
            contratoB.decimals().catch(() => 18)
        ]);

        const vA = ethers.utils.parseUnits(amountA, decA);
        const vB = ethers.utils.parseUnits(amountB, decB);

        // 2. Aprovação EXATA
        window.alert("Aprovando tokens...");
        const txAppA = await contratoA.approve(ROUTER_ADDRESS, vA);
        await txAppA.wait();
        const txAppB = await contratoB.approve(ROUTER_ADDRESS, vB);
        await txAppB.wait();

        const deadline = Math.floor(Date.now() / 1000) + 1200;

        // 3. Tenta Adicionar Liquidez
        // Se a Pool da Synthra for V3, esta função V2 pode estar desabilitada no Router deles.
        window.alert("Enviando Transação...");
        const tx = await router.addLiquidity(
            tokenA, 
            tokenB, 
            vA, 
            vB, 
            0, 
            0, 
            userAddress, 
            deadline,
            { gasLimit: 500000 } // Aumentado para cobrir a lógica complexa da Synthra
        );

        console.log("Hash:", tx.hash);
        await tx.wait();
        window.alert("✅ Liquidez Adicionada!");

    } catch (e: any) {
        console.error(e);
        // Captura o erro detalhado da simulação
        window.alert("Erro: " + (e.reason || e.message || "Verifique o console"));
    }
};