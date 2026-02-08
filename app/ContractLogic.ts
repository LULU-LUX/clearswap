import { ethers } from 'ethers';

// ABI do Router com Swap e Liquidez
const ROUTER_ABI = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)",
    "function decimals() public view returns (uint8)"
];

const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008";

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

        // Approve automático se necessário
        const allowance = await tokenContrato.allowance(userAddress, ROUTER_ADDRESS);
        if (allowance.lt(valorWei)) {
            const tx = await tokenContrato.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
            await tx.wait();
        }

        const path = [tokenA, tokenB];
        const deadline = Math.floor(Date.now() / 1000) + 1200;

        const txSwap = await routerContrato.swapExactTokensForTokens(valorWei, 0, path, userAddress, deadline, { gasLimit: 300000 });
        await txSwap.wait();
        window.alert("Swap realizado!");
    } catch (e: any) { window.alert("Erro no Swap: " + e.message); }
};

export const adicionarLiquidezContrato = async (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);

        // 1. Approve para os DOIS tokens
        const tA = new ethers.Contract(tokenA, ERC20_ABI, signer);
        const tB = new ethers.Contract(tokenB, ERC20_ABI, signer);
        
        window.alert("Aprovando tokens para a Pool...");
        await (await tA.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256)).wait();
        await (await tB.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256)).wait();

        // 2. Adicionar Liquidez
        window.alert("Enviando liquidez para o contrato...");
        const valA = ethers.utils.parseUnits(amountA, 18);
        const valB = ethers.utils.parseUnits(amountB, 18);
        const deadline = Math.floor(Date.now() / 1000) + 1200;

        const tx = await router.addLiquidity(
            tokenA, tokenB,
            valA, valB,
            0, 0, // Minutos em 0 para facilitar na testnet
            userAddress,
            deadline,
            { gasLimit: 1000000 }
        );

        await tx.wait();
        window.alert("Liquidez Adicionada! Agora você já pode fazer Swaps.");
    } catch (e: any) { window.alert("Erro na Pool: " + e.message); }
};