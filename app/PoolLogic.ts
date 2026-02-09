import { ethers } from 'ethers';

const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008";

const ROUTER_ABI = [
    "function mint(tuple(address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function decimals() public view returns (uint8)"
];

export const gerenciarLiquidez = async (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);

        // Configuração de Gás baseada no documento da ARC
        // Mínimo é 160 Gwei, vamos usar 200 para garantir que passe rápido
        const gasPrice = ethers.utils.parseUnits('200', 'gwei');

        const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
        const [amt0, amt1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [amountA, amountB] : [amountB, amountA];

        const c0 = new ethers.Contract(token0, ERC20_ABI, signer);
        const c1 = new ethers.Contract(token1, ERC20_ABI, signer);

        // Confirmado pelo doc: USDC e tokens na ARC usam 18 decimais
        const v0 = ethers.utils.parseUnits(amt0, 18);
        const v1 = ethers.utils.parseUnits(amt1, 18);

        window.alert("Passo 1: Aprovando Tokens com Gás da ARC...");
        
        // Aplicando o gasPrice manual nas aprovações
        const txA = await c0.approve(ROUTER_ADDRESS, v0, { gasPrice });
        await txA.wait();
        const txB = await c1.approve(ROUTER_ADDRESS, v1, { gasPrice });
        await txB.wait();

        const params = {
            token0: token0,
            token1: token1,
            fee: 3000, // Testando com 0.3% primeiro
            tickLower: -887220, 
            tickUpper: 887220,
            amount0Desired: v0,
            amount1Desired: v1,
            amount0Min: 0,
            amount1Min: 0,
            recipient: userAddress,
            deadline: Math.floor(Date.now() / 1000) + 1200
        };

        window.alert("Passo 2: Enviando Mint (200 Gwei)...");
        
        const tx = await router.mint(params, { 
            gasPrice,
            gasLimit: 1000000 // Limite alto para garantir
        });

        console.log("TX enviada com 200 Gwei:", tx.hash);
        await tx.wait();
        window.alert("✅ SUCESSO! Liquidez adicionada na Arc Testnet.");

    } catch (e: any) {
        console.error("Erro na transação:", e);
        const msg = e.reason || e.message;
        window.alert("Falha na ARC: " + msg);
    }
};