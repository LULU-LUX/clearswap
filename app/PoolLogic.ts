import { ethers } from 'ethers';

// SEU NOVO ROUTER INTELIGENTE
const ROUTER_ADDRESS = "0x7476A4db27255C51344ae438d2975E301cd28CE7";

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
        const gasPrice = ethers.utils.parseUnits('200', 'gwei');

        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
        const deadline = Math.floor(Date.now() / 1000) + 600;

        const tx = await router.addLiquidity(
            tokenA,
            tokenB,
            ethers.utils.parseUnits(amountA, 18),
            ethers.utils.parseUnits(amountB, 18),
            userAddress,
            deadline,
            {
                gasPrice: ethers.utils.parseUnits('200', 'gwei'),
                gasLimit: 800000
            }
        );

        await tx.wait();
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};
