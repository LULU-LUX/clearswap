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
const ROUTER_ADDRESS = "0xa5043ad790d4E41e09C9c04BCD44Ddcf853D101c";

export const executarSwapContrato = async (tokenA: string, tokenB: string, amount: string, slippage: string) => {
    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        const tokenContrato = new ethers.Contract(tokenA, ERC20_ABI, signer);
        const routerContrato = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
        
        const decimals = await tokenContrato.decimals().catch(() => 18);
        const valorWei = ethers.utils.parseUnits(amount || "0", decimals);

        const allowance = await tokenContrato.allowance(userAddress, ROUTER_ADDRESS);
        if (allowance.lt(valorWei)) {
            const tx = await tokenContrato.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
            await tx.wait();
        }

        const path = [tokenA, tokenB];
        const deadline = Math.floor(Date.now() / 1000) + 1200;

        // Nota: Certifique-se que seu contrato 0xa504 possui esta função
        const txSwap = await routerContrato.swapExactTokensForTokens(valorWei, 0, path, userAddress, deadline, { gasLimit: 300000 });
        await txSwap.wait();
        window.alert("Swap realizado!");
    } catch (e: any) { window.alert("Erro no Swap: " + e.message); }
};

export const adicionarLiquidezContrato = async (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
    // Esta função pode ser mantida ou você pode centralizar tudo no adicionarLiquidez do PoolLogic
    // Para evitar confusão, no page.tsx, use apenas a função do PoolLogic.
};