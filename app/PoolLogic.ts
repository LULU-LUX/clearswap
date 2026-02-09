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
        if (!ethereum) return window.alert("Instale a MetaMask!");

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);

        // Função interna para converter e aprovar tokens
        const prepararToken = async (addr: string, amount: string) => {
            const contrato = new ethers.Contract(addr, ERC20_ABI, signer);
            
            // Forçamos 18 decimais se a rede falhar em responder, mas tentamos ler antes
            let decimals = 18;
            try { decimals = await contrato.decimals(); } catch(e) { console.log("Usando 18 decimais padrão"); }
            
            const valorWei = ethers.utils.parseUnits(amount, decimals);
            const allowance = await contrato.allowance(userAddress, ROUTER_ADDRESS);
            
            if (allowance.lt(valorWei)) {
                window.alert(`Aprovando Token ${addr.slice(0,6)}...`);
                const tx = await contrato.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
                await tx.wait();
            }
            return valorWei;
        };

        // Converte os valores para Wei (os números gigantes que o contrato entende)
        const vA = await prepararToken(tokenA, amountA);
        const vB = await prepararToken(tokenB, amountB);

        window.alert("Tokens aprovados! Confirmando depósito na Pool...");
        
        const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutos

        // Chamada oficial para o contrato
        const tx = await router.addLiquidity(
            tokenA, 
            tokenB, 
            vA, 
            vB, 
            0, // amountAMin (0 para evitar erros de slippage em testnet)
            0, // amountBMin
            userAddress, 
            deadline, 
            { gasLimit: 1000000 }
        );

        console.log("TX enviada:", tx.hash);
        await tx.wait();
        window.alert("✅ Liquidez adicionada com sucesso!");

    } catch (e: any) {
        console.error(e);
        window.alert("Erro na Transação: " + (e.reason || e.message));
    }
};