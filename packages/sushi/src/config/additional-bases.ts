import { ChainId } from '../chain'
import { Token } from '../currency'
import {
  APE_ADDRESS,
  BCT_ADDRESS,
  FEI_ADDRESS,
  FRAX_ADDRESS,
  FXS_ADDRESS,
  KLIMA_ADDRESS,
  KP3R_ADDRESS,
  LDO_ADDRESS,
  PRIMATE_ADDRESS,
  SUSHI_ADDRESS,
  SWISE_ADDRESS,
  TRIBE_ADDRESS,
  WBTC_ADDRESS,
  XSUSHI_ADDRESS,
  rETH2_ADDRESS,
  renBTC_ADDRESS,
} from '../currency/token-addresses'
import {
  AAVE,
  APE,
  BCT,
  COMP,
  CRV,
  ENJ,
  FEI,
  FRAX,
  FXS,
  GALA,
  KLIMA,
  KP3R,
  LDO,
  LINK,
  MANA,
  MKR,
  PRIMATE,
  SNX,
  SUSHI,
  TRIBE,
  WBTC,
  XSUSHI,
  YFI,
  renBTC,
  sETH2,
} from '../currency/tokens'

export const ADDITIONAL_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] }
} = {
  [ChainId.ETHEREUM]: {
    [rETH2_ADDRESS[ChainId.ETHEREUM]]: [sETH2[ChainId.ETHEREUM]],
    [SWISE_ADDRESS[ChainId.ETHEREUM]]: [sETH2[ChainId.ETHEREUM]],
    [FEI_ADDRESS[ChainId.ETHEREUM]]: [TRIBE[ChainId.ETHEREUM]],
    [TRIBE_ADDRESS[ChainId.ETHEREUM]]: [FEI[ChainId.ETHEREUM]],
    [FRAX_ADDRESS[ChainId.ETHEREUM]]: [FXS[ChainId.ETHEREUM]],
    [FXS_ADDRESS[ChainId.ETHEREUM]]: [FRAX[ChainId.ETHEREUM]],
    [WBTC_ADDRESS[ChainId.ETHEREUM]]: [renBTC[ChainId.ETHEREUM]],
    [renBTC_ADDRESS[ChainId.ETHEREUM]]: [WBTC[ChainId.ETHEREUM]],
    [APE_ADDRESS[ChainId.ETHEREUM]]: [PRIMATE[ChainId.ETHEREUM]],
    [PRIMATE_ADDRESS[ChainId.ETHEREUM]]: [APE[ChainId.ETHEREUM]],
    [SUSHI_ADDRESS[ChainId.ETHEREUM]]: [XSUSHI[ChainId.ETHEREUM]],
    [XSUSHI_ADDRESS[ChainId.ETHEREUM]]: [SUSHI[ChainId.ETHEREUM]],
    [KP3R_ADDRESS[ChainId.ETHEREUM]]: [LDO[ChainId.ETHEREUM]],
    [LDO_ADDRESS[ChainId.ETHEREUM]]: [KP3R[ChainId.ETHEREUM]],
    ['0x1e0275806C3CD0bDb5C99916A064d36b5e8eAE8d']: [
      // TWO
      AAVE[ChainId.ETHEREUM],
      MKR[ChainId.ETHEREUM],
      SNX[ChainId.ETHEREUM],
      CRV[ChainId.ETHEREUM],
      YFI[ChainId.ETHEREUM],
      ENJ[ChainId.ETHEREUM],
      COMP[ChainId.ETHEREUM],
      GALA[ChainId.ETHEREUM],
      XSUSHI[ChainId.ETHEREUM],
    ],
  },
  [ChainId.POLYGON]: {
    [FRAX_ADDRESS[ChainId.POLYGON]]: [FXS[ChainId.POLYGON]],
    [FXS_ADDRESS[ChainId.POLYGON]]: [FRAX[ChainId.POLYGON]],
    [BCT_ADDRESS[ChainId.POLYGON]]: [KLIMA[ChainId.POLYGON]],
    [KLIMA_ADDRESS[ChainId.POLYGON]]: [BCT[ChainId.POLYGON]],
    // THREE
    ['0x9B034262e0095210ab9ddec60199741a8a1FbFe7']: [
      AAVE[ChainId.POLYGON],
      LINK[ChainId.POLYGON],
      MANA[ChainId.POLYGON],
      SNX[ChainId.POLYGON],
      CRV[ChainId.POLYGON],
      YFI[ChainId.POLYGON],
      // ENJ[ChainId.POLYGON], // could not find on polygon
    ],
  },
  [ChainId.ARBITRUM]: {
    [FRAX_ADDRESS[ChainId.ARBITRUM]]: [FXS[ChainId.ARBITRUM]],
    [FXS_ADDRESS[ChainId.ARBITRUM]]: [FRAX[ChainId.ARBITRUM]],
  },
  [ChainId.FANTOM]: {
    [FRAX_ADDRESS[ChainId.FANTOM]]: [FXS[ChainId.FANTOM]],
    [FXS_ADDRESS[ChainId.FANTOM]]: [FRAX[ChainId.FANTOM]],
  },
  [ChainId.BSC]: {
    [FRAX_ADDRESS[ChainId.BSC]]: [FXS[ChainId.BSC]],
    [FXS_ADDRESS[ChainId.BSC]]: [FRAX[ChainId.BSC]],
  },
  [ChainId.AVALANCHE]: {
    [FRAX_ADDRESS[ChainId.AVALANCHE]]: [FXS[ChainId.AVALANCHE]],
    [FXS_ADDRESS[ChainId.AVALANCHE]]: [FRAX[ChainId.AVALANCHE]],
  },
  [ChainId.MOONRIVER]: {
    [FRAX_ADDRESS[ChainId.MOONRIVER]]: [FXS[ChainId.MOONRIVER]],
    [FXS_ADDRESS[ChainId.MOONRIVER]]: [FRAX[ChainId.MOONRIVER]],
  },
  [ChainId.MOONBEAM]: {
    [FRAX_ADDRESS[ChainId.MOONBEAM]]: [FXS[ChainId.MOONBEAM]],
    [FXS_ADDRESS[ChainId.MOONBEAM]]: [FRAX[ChainId.MOONBEAM]],
  },
  [ChainId.HARMONY]: {
    [FRAX_ADDRESS[ChainId.HARMONY]]: [FXS[ChainId.HARMONY]],
    [FXS_ADDRESS[ChainId.HARMONY]]: [FRAX[ChainId.HARMONY]],
  },
  [ChainId.BOBA]: {
    [FRAX_ADDRESS[ChainId.BOBA]]: [FXS[ChainId.BOBA]],
    [FXS_ADDRESS[ChainId.BOBA]]: [FRAX[ChainId.BOBA]],
  },
  [ChainId.OPTIMISM]: {
    [FRAX_ADDRESS[ChainId.OPTIMISM]]: [FXS[ChainId.OPTIMISM]],
    [FXS_ADDRESS[ChainId.OPTIMISM]]: [FRAX[ChainId.OPTIMISM]],
  },
}
