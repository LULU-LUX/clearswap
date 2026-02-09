import { ethers } from 'ethers';

const ROUTER_ABI = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)",
    "function decimals() public view returns (uint8)"
];

const ROUTER_ADDRESS = "0x9F602BAC5F51fB5B6f54a621B0BF33d5606c1E97";

export const executarSwapContrato = async (tokenA: string, tokenB: string, amount: string, slippage: string) => {
    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        const tokenContrato = new ethers.Contract(tokenA, ERC20_ABI, signer);
        const routerContrato = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
        
        // PEGA OS DECIMAIS REAIS
        const decimals = await tokenContrato.decimals();
        const valorWei = ethers.utils.parseUnits(amount || "0", decimals);

        // APROVAÇÃO
        const allowance = await tokenContrato.allowance(userAddress, ROUTER_ADDRESS);
        if (allowance.lt(valorWei)) {
            const tx = await tokenContrato.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
            await tx.wait();
        }

        const path = [tokenA, tokenB];
        const deadline = Math.floor(Date.now() / 1000) + 1200;

        const txSwap = await routerContrato.swapExactTokensForTokens(
            valorWei,
            0, // amountOutMin
            path,
            userAddress,
            deadline,
            {
                gasLimit: 500000,
                gasPrice: ethers.utils.parseUnits('200', 'gwei')
            }
        );
        await txSwap.wait();
        window.alert("Swap realizado com sucesso!");
    } catch (e: any) { 
        console.error(e);
        window.alert("Erro no Swap: " + (e.reason || e.message)); 
    }
};

export const adicionarLiquidezContrato = async () => {};