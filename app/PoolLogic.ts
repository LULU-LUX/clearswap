import { ethers } from 'ethers';

const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008";

const ROUTER_ABI = [
    "function mint(tuple(address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
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

        // Organizar endereços (Token0 sempre deve ser o menor endereço)
        const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
        const [amount0Raw, amount1Raw] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [amountA, amountB] : [amountB, amountA];

        const c0 = new ethers.Contract(token0, ERC20_ABI, signer);
        const c1 = new ethers.Contract(token1, ERC20_ABI, signer);

        const v0 = ethers.utils.parseUnits(amount0Raw, 18);
        const v1 = ethers.utils.parseUnits(amount1Raw, 18);

        window.alert("Aprovando tokens para a Synthra...");
        await (await c0.approve(ROUTER_ADDRESS, v0)).wait();
        await (await c1.approve(ROUTER_ADDRESS, v1)).wait();

        const params = {
            token0: token0,
            token1: token1,
            fee: 3000, // Taxa padrão de 0.3%
            tickLower: -887220, // Faixa ampla (Full Range)
            tickUpper: 887220,
            amount0Desired: v0,
            amount1Desired: v1,
            amount0Min: 0,
            amount1Min: 0,
            recipient: userAddress,
            deadline: Math.floor(Date.now() / 1000) + 1200
        };

        window.alert("Criando posição na Pool V3...");
        const tx = await router.mint(params, { gasLimit: 3000000 });
        await tx.wait();
        window.alert("✅ Liquidez adicionada com sucesso!");

    } catch (e: any) {
        console.error(e);
        window.alert("Erro Synthra: " + (e.reason || e.message));
    }
};