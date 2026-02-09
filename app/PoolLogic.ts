import { ethers } from 'ethers';

// SEU NOVO ROUTER INTELIGENTE
const ROUTER_ADDRESS = "0x6178b6b228316203239740A05ba77b78a1e8Cb18";

const ROUTER_ABI = [
    "function consultarSaida(address tokenIn, address tokenOut, uint amountIn) external view returns (uint)",
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, address to, uint deadline) external returns (uint, uint)"
];

// Função que o seu Front-end vai usar para preencher o campo B automaticamente
export const calcularValorAutomatico = async (quantidade: string, tokenA: string, tokenB: string) => {
    if (!quantidade || quantidade === "0" || isNaN(Number(quantidade))) return "0";

    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);

        // Convertendo para 18 decimais (padrão da Arc para USDC/EURC)
        const valorEntrada = ethers.utils.parseUnits(quantidade, 18);

        // Chama o SEU contrato para calcular o preço real da pool
        const valorSaida = await router.consultarSaida(tokenA, tokenB, valorEntrada);
        
        return ethers.utils.formatUnits(valorSaida, 18);
    } catch (e) {
        // Se a pool ainda não existir ou estiver vazia, retornamos o mesmo valor (1:1) para teste
        console.warn("Aguardando liquidez na pool...");
        return quantidade; 
    }
};

// Função para adicionar liquidez (Deploy da sua própria Pool)
export const adicionarLiquidez = async (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        // ABI MÍNIMA PARA O APPROVE
        const ERC20_ABI = [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function allowance(address owner, address spender) public view returns (uint256)"
        ];

        const contractA = new ethers.Contract(tokenA, ERC20_ABI, signer);
        const contractB = new ethers.Contract(tokenB, ERC20_ABI, signer);
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);

        const valA = ethers.utils.parseUnits(amountA, 18);
        const valB = ethers.utils.parseUnits(amountB, 18);

        // 1. APROVAR TOKEN A
        console.log("Aprovando Token A...");
        const allowanceA = await contractA.allowance(userAddress, ROUTER_ADDRESS);
        if (allowanceA.lt(valA)) {
            const txA = await contractA.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
            await txA.wait();
        }

        // 2. APROVAR TOKEN B
        console.log("Aprovando Token B...");
        const allowanceB = await contractB.allowance(userAddress, ROUTER_ADDRESS);
        if (allowanceB.lt(valB)) {
            const txB = await contractB.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
            await txB.wait();
        }

        // 3. ADICIONAR LIQUIDEZ
        const deadline = Math.floor(Date.now() / 1000) + 600;
        const tx = await router.addLiquidity(
            tokenA,
            tokenB,
            valA,
            valB,
            userAddress,
            deadline,
            {
                gasPrice: ethers.utils.parseUnits('200', 'gwei'),
                gasLimit: 800000
            }
        );

        await tx.wait();
        window.alert("Liquidez adicionada com sucesso!");
        return true;
    } catch (e: any) {
        console.error(e);
        window.alert("Erro: " + (e.reason || e.message));
        return false;
    }
};