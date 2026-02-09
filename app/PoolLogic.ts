import { ethers } from 'ethers';

const ROUTER_ADDRESS = "0x6178b6b228316203239740A05ba77b78a1e8Cb18";

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
        
        return ethers.utils.formatUnits(valorSaida, decimalsA);
    } catch (e) {
        return quantidade; 
    }
};

export const adicionarLiquidez = async (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
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
        if (allowanceA.lt(valA)) {
            const txA = await contractA.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
            await txA.wait();
        }

        // 2. APROVAR TOKEN B
        const allowanceB = await contractB.allowance(userAddress, ROUTER_ADDRESS);
        if (allowanceB.lt(valB)) {
            const txB = await contractB.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
            await txB.wait();
        }

        // 3. ADICIONAR LIQUIDEZ
        const deadline = Math.floor(Date.now() / 1000) + 600;
        const tx = await router.addLiquidity(
            tokenA, tokenB, valA, valB, userAddress, deadline,
            {
                gasPrice: ethers.utils.parseUnits('200', 'gwei'),
                gasLimit: 500000
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
};