import { ethers } from 'ethers';

// O SEU NOVO ENDEREÇO DO ROUTER
const ROUTER_ADDRESS = "0x0624FB5d1b8F50B4ad11Bcae7C5AbFdf8233076e";

// ABI Simplificada para o SEU SimpleRouter
const ROUTER_ABI = [
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, address to, uint deadline) external returns (uint amountA, uint amountB)"
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

        // Preço de Gás da Arc (conforme o documento que você enviou)
        const gasPrice = ethers.utils.parseUnits('200', 'gwei');

        // Na ARC, USDC e EURC usam 18 decimais
        const vA = ethers.utils.parseUnits(amountA, 18);
        const vB = ethers.utils.parseUnits(amountB, 18);

        const cA = new ethers.Contract(tokenA, ERC20_ABI, signer);
        const cB = new ethers.Contract(tokenB, ERC20_ABI, signer);

        window.alert("Passo 1: Autorizando o uso dos tokens no seu Router...");
        const txA = await cA.approve(ROUTER_ADDRESS, vA, { gasPrice });
        await txA.wait();
        const txB = await cB.approve(ROUTER_ADDRESS, vB, { gasPrice });
        await txB.wait();

        window.alert("Passo 2: Enviando para a sua própria Pool...");
        
        const deadline = Math.floor(Date.now() / 1000) + 600;

        const tx = await router.addLiquidity(
            tokenA,
            tokenB,
            vA,
            vB,
            userAddress,
            deadline,
            { gasPrice, gasLimit: 300000 }
        );

        console.log("Sucesso na sua DEX! Hash:", tx.hash);
        await tx.wait();
        window.alert("✅ PARABÉNS! Liquidez enviada para o SEU contrato!");

    } catch (e: any) {
        console.error(e);
        window.alert("Erro no seu Router: " + (e.reason || e.message));
    }
};