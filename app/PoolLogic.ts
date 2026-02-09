import { ethers } from 'ethers';

const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008";
const ERC20_ABI = ["function approve(address spender, uint256 amount) public returns (bool)", "function allowance(address owner, address spender) public view returns (uint256)", "function balanceOf(address owner) public view returns (uint256)"];
const ROUTER_ABI = ["function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)"];

export const gerenciarLiquidez = async (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);

        const vA = ethers.utils.parseUnits(amountA, 18);
        const vB = ethers.utils.parseUnits(amountB, 18);

        // CHECAGEM DE SALDO ANTES DE TENTAR
        const cA = new ethers.Contract(tokenA, ERC20_ABI, signer);
        const cB = new ethers.Contract(tokenB, ERC20_ABI, signer);
        const balA = await cA.balanceOf(userAddress);
        const balB = await cB.balanceOf(userAddress);

        if (balA.lt(vA) || balB.lt(vB)) {
            return window.alert(`Saldo insuficiente! Você tem ${ethers.utils.formatUnits(balA, 18)} de A e ${ethers.utils.formatUnits(balB, 18)} de B.`);
        }

        // APROVAÇÕES
        window.alert("Verificando aprovações...");
        const txA = await cA.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
        await txA.wait();
        const txB = await cB.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
        await txB.wait();

        const deadline = Math.floor(Date.now() / 1000) + 1200;

        // ESTIMATE GAS: Se isso falhar, a MetaMask vai te avisar antes de você clicar em confirmar
        window.alert("Simulando transação...");
        const gasEstimate = await router.estimateGas.addLiquidity(tokenA, tokenB, vA, vB, 0, 0, userAddress, deadline).catch((err) => {
            console.log("Erro na simulação:", err);
            throw new Error("O contrato rejeitou a simulação. Verifique se a Pool já existe ou se os endereços estão corretos.");
        });

        const tx = await router.addLiquidity(tokenA, tokenB, vA, vB, 0, 0, userAddress, deadline, { gasLimit: gasEstimate.add(100000) });
        await tx.wait();
        window.alert("✅ Liquidez adicionada!");

    } catch (e: any) {
        window.alert("FALHA: " + (e.reason || e.message));
    }
};