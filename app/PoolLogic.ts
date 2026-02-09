import { ethers } from 'ethers';

const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008";

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)"
];

const ROUTER_ABI = [
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)"
];

export const gerenciarLiquidez = async (tokenA: string, tokenB: string, amountA: string, amountB: string) => {
    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);

        // FORÇANDO 18 DECIMAIS NA MÃO PARA GARANTIR
        const vA = ethers.utils.parseUnits(amountA, 18);
        const vB = ethers.utils.parseUnits(amountB, 18);

        // APROVAÇÃO TOKEN A
        const contratoA = new ethers.Contract(tokenA, ERC20_ABI, signer);
        const allowA = await contratoA.allowance(userAddress, ROUTER_ADDRESS);
        if (allowA.lt(vA)) {
            const txA = await contratoA.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
            await txA.wait();
        }

        // APROVAÇÃO TOKEN B
        const contratoB = new ethers.Contract(tokenB, ERC20_ABI, signer);
        const allowB = await contratoB.allowance(userAddress, ROUTER_ADDRESS);
        if (allowB.lt(vB)) {
            const txB = await contratoB.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
            await txB.wait();
        }

        const deadline = Math.floor(Date.now() / 1000) + 1200;

        // CHAMADA DA LIQUIDEZ
        const tx = await router.addLiquidity(
            tokenA, 
            tokenB, 
            vA, 
            vB, 
            0, 
            0, 
            userAddress, 
            deadline, 
            { gasLimit: 1000000 }
        );

        await tx.wait();
        window.alert("✅ Sucesso!");

    } catch (e: any) {
        console.error(e);
        window.alert("Erro: " + (e.reason || e.message));
    }
};