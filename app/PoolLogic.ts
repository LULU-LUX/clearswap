import { ethers } from 'ethers';

const ROUTER_ADDRESS = "0x0E00009d00d1000069ed00A908e00081F5006008";

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)",
    "function decimals() public view returns (uint8)"
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

        const prepararToken = async (addr: string, amount: string) => {
            const contrato = new ethers.Contract(addr, ERC20_ABI, signer);
            const decimals = await contrato.decimals().catch(() => 18);
            const valorWei = ethers.utils.parseUnits(amount, decimals);
            const allowance = await contrato.allowance(userAddress, ROUTER_ADDRESS);
            
            if (allowance.lt(valorWei)) {
                window.alert(`Aprovando Token...`);
                const tx = await contrato.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
                await tx.wait();
            }
            return valorWei;
        };

        const vA = await prepararToken(tokenA, amountA);
        const vB = await prepararToken(tokenB, amountB);

        window.alert("Tokens aprovados! Confirmando depósito na Pool...");
        const deadline = Math.floor(Date.now() / 1000) + 1200;

        const tx = await router.addLiquidity(tokenA, tokenB, vA, vB, 0, 0, userAddress, deadline, { gasLimit: 1000000 });
        await tx.wait();
        window.alert("✅ Liquidez adicionada com sucesso!");
    } catch (e: any) {
        window.alert("Erro: " + (e.data?.message || e.message));
    }
};