import { ethers } from 'ethers';

const ROUTER_ABI = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, address to, uint deadline) external returns (uint, uint)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)",
    "function decimals() public view returns (uint8)"
];

// USANDO O MESMO ENDEREÇO DO POOLLOGIC
const ROUTER_ADDRESS = "0x6178b6b228316203239740A05ba77b78a1e8Cb18";

export const executarSwapContrato = async (tokenA: string, tokenB: string, amount: string, slippage: string) => {
    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        const tokenContrato = new ethers.Contract(tokenA, ERC20_ABI, signer);
        const routerContrato = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
        
        // Na ARC Testnet, USDC e EURC usam 18 decimais, não 6.
        const valorWei = ethers.utils.parseUnits(amount || "0", 18);

        const allowance = await tokenContrato.allowance(userAddress, ROUTER_ADDRESS);
        if (allowance.lt(valorWei)) {
            // Adicionado Gwei e Gas aqui para não travar a permissão
            const tx = await tokenContrato.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256, {
                gasPrice: ethers.utils.parseUnits('200', 'gwei'),
                gasLimit: 100000
            });
            await tx.wait();
        }

        const path = [tokenA, tokenB];
        const deadline = Math.floor(Date.now() / 1000) + 1200;

        // Nota: Certifique-se que seu contrato 0xa504 possui esta função
        const txSwap = await routerContrato.swapExactTokensForTokens(
            valorWei,
            0,
            path,
            userAddress,
            deadline,
            {
                gasLimit: 500000,
                gasPrice: ethers.utils.parseUnits('200', 'gwei')
            }
        );
        await txSwap.wait();
        window.alert("Swap realizado!");
    } catch (e: any) { window.alert("Erro no Swap: " + e.message); }
};

export const adicionarLiquidezContrato = async (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
    // Esta função pode ser mantida ou você pode centralizar tudo no adicionarLiquidez do PoolLogic
    // Para evitar confusão, no page.tsx, use apenas a função do PoolLogic.
};