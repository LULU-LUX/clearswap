import { ethers } from 'ethers';

const ROUTER_ABI = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)",
    "function decimals() public view returns (uint8)"
];

const ROUTER_ADDRESS = "0xeac628965177a5D26d9F0c31090B95BE07aE0F67";

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
                gasPrice: ethers.utils.parseUnits('250', 'gwei'),
                gasLimit: 1000000
            }
        );
        await txSwap.wait();
        window.alert("Swap realizado com sucesso!");
    } catch (e: any) { 
        console.error(e);
        window.alert("Erro no Swap: " + (e.reason || e.message)); 
    }
};

export const adicionarLiquidez = async (tokenA: string, tokenB: string, amountA: string, amountB: string, slippage: string) => {
    try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        const POOL_ABI = [
            "function addLiquidity(uint amountA, uint amountB, uint amountAMin, uint amountBMin, address to) external",
            "function decimals() public view returns (uint8)"
        ];
        
        const POOL_ADDRESS = "0x8E8A6b6B5445214E9F76E21568478440E0C72570"; 
        const poolContrato = new ethers.Contract(POOL_ADDRESS, POOL_ABI, signer);

        const dec = 6; 
        const valA = ethers.utils.parseUnits(amountA.replace(',', '.'), dec);
        const valB = ethers.utils.parseUnits(amountB.replace(',', '.'), dec);

        // CÁLCULO DINÂMICO BASEADO NO SEU ÍCONE DE SLIPPAGE
        // Se slippage for 3%, multiplicamos por (100 - 3) = 97 e dividimos por 100
        const slipPercent = parseFloat(slippage.replace(',', '.'));
        const fatorSlippage = 100 - slipPercent;

        const minA = valA.mul(Math.floor(fatorSlippage)).div(100);
        const minB = valB.mul(Math.floor(fatorSlippage)).div(100);

        const tx = await poolContrato.addLiquidity(
            valA,
            valB,
            minA,
            minB,
            userAddress,
            {
                gasLimit: 1000000,
                gasPrice: ethers.utils.parseUnits('250', 'gwei')
            }
        );

        await tx.wait();
        window.alert("Liquidez adicionada com a sua slippage de " + slippage + "%!");
    } catch (e: any) {
        console.error(e);
        window.alert("Erro: " + (e.reason || e.message));
    }
};