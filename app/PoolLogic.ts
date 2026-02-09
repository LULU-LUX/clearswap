import { ethers } from 'ethers';

// Endereços baseados no código da Synthra que você passou
const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008"; 

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)",
    "function balanceOf(address owner) public view returns (uint256)"
];

// ABI focada no SwapRouter02 da Synthra que suporta Multicall e as funções que você mandou
const ROUTER_ABI = [
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
    "function mint(tuple(address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
];

export const gerenciarLiquidez = async (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        
        // No código da Synthra, o Router02 é o ponto de entrada
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);

        const vA = ethers.utils.parseUnits(amountA, 18);
        const vB = ethers.utils.parseUnits(amountB, 18);

        // APROVAÇÕES (A Synthra usa o PositionManager, mas o Router02 recebe as aprovações para repassar)
        const cA = new ethers.Contract(tokenA, ERC20_ABI, signer);
        const cB = new ethers.Contract(tokenB, ERC20_ABI, signer);
        
        window.alert("Aprovando Tokens...");
        const txA = await cA.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
        await txA.wait();
        const txB = await cB.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
        await txB.wait();

        const deadline = Math.floor(Date.now() / 1000) + 1200;

        window.alert("Iniciando addLiquidity no SwapRouter02...");

        // Tentativa 1: addLiquidity padrão (V2 compatibility)
        // Se falhar, é porque a Pool precisa ser criada via V3 (Mint)
        const tx = await router.addLiquidity(
            tokenA, 
            tokenB, 
            vA, 
            vB, 
            0, 
            0, 
            userAddress, 
            deadline,
            { gasLimit: 2000000 } // Aumentamos o gas pois contratos complexos da Synthra gastam mais
        );

        await tx.wait();
        window.alert("✅ Sucesso na Pool!");

    } catch (e: any) {
        console.error("Erro completo:", e);
        // Captura o erro '0x' e tenta explicar
        const errorMsg = e.reason || e.message;
        if (errorMsg.includes("execution reverted")) {
            window.alert("O contrato Reverteu. Provavelmente esta Pool exige parâmetros de V3 (Ticks) ou o Router da Synthra é diferente.");
        } else {
            window.alert("Erro: " + errorMsg);
        }
    }
};