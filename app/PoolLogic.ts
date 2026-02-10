import { ethers } from 'ethers';

const ROUTER_ADDRESS = "0xeac628965177a5D26d9F0c31090B95BE07aE0F67";

const ROUTER_ABI = [
    "function consultarSaida(address tokenIn, address tokenOut, uint amountIn) external view returns (uint)",
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, address to, uint deadline) external returns (uint, uint)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)",
    "function balanceOf(address owner) public view returns (uint256)",
    "function decimals() public view returns (uint8)"
];

export const calcularValorAutomatico = async (quantidade: string, tokenA: string, tokenB: string) => {
    if (!quantidade || quantidade === "0" || isNaN(Number(quantidade))) return "0";
    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const tokenAContract = new ethers.Contract(tokenA, ERC20_ABI, provider);
        const decimalsA = await tokenAContract.decimals();
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);

        const valorEntrada = ethers.utils.parseUnits(quantidade, decimalsA);
        const valorSaida = await router.consultarSaida(tokenA, tokenB, valorEntrada);
        
        return ethers.utils.formatUnits(valorSaida, decimalsA).replace(',', '.');
    } catch (e) {
        return quantidade; 
    }
};

export const adicionarLiquidez = async (tokenA: string, tokenB: string, amountA: string, amountB: string, slippage: string) => {
    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        const contractA = new ethers.Contract(tokenA, ERC20_ABI, signer);
        const contractB = new ethers.Contract(tokenB, ERC20_ABI, signer);
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);

        // PEGA OS DECIMAIS REAIS DE CADA TOKEN
        const decA = await contractA.decimals();
        const decB = await contractB.decimals();

        const valA = ethers.utils.parseUnits(amountA, decA);
        const valB = ethers.utils.parseUnits(amountB, decB);

// 1. APROVAR TOKEN A
        const allowanceA = await contractA.allowance(userAddress, ROUTER_ADDRESS);
        console.log("Permissão Token A:", allowanceA.toString());
        
        // Mudança: Se o valor for menor que o necessário ou se quisermos garantir, aprovamos.
        if (allowanceA.lt(valA)) {
            console.log("Solicitando aprovação para Token A...");
            const txA = await contractA.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
            await txA.wait();
        }

        // 2. APROVAR TOKEN B
        const allowanceB = await contractB.allowance(userAddress, ROUTER_ADDRESS);
        console.log("Permissão Token B:", allowanceB.toString());

        if (allowanceB.lt(valB)) {
            console.log("Solicitando aprovação para Token B...");
            const txB = await contractB.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
            await txB.wait();
        }

        // 3. ADICIONAR LIQUIDEZ (Ajustado para evitar erro de RPC)
        const deadline = Math.floor(Date.now() / 1000) + 3600; 
        const tx = await router.addLiquidity(
            tokenA, tokenB, valA, valB, userAddress, deadline,
            {
                gasPrice: ethers.utils.parseUnits('250', 'gwei'),
                gasLimit: 1000000
            }
        );

        await tx.wait();
        window.alert("Liquidez Adicionada!");
        return true;
    } catch (e: any) {
        console.error(e);
        window.alert("Erro: " + (e.reason || e.message));
        return false;
    }
};  // build force 1