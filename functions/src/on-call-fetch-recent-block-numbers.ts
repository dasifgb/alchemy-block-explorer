import * as functions from 'firebase-functions';
import { SecretsManagerKeyNames } from '../../shared-models/environments/env-vars.model';
import { alchemy } from './config';

const fetchLatestBlockNumber = async () => {
  const blockNumber = await alchemy.core.getBlockNumber()
    .catch(err => {functions.logger.log(`Failed to fetch latest block number:`, err); throw new functions.https.HttpsError('internal', err);});
  functions.logger.log(`Found this latest block:`, blockNumber);
  return blockNumber;
}

const generateLastTenBlockNumbers = async () => {
  const startingBlock = await fetchLatestBlockNumber();
  let currentBlock = startingBlock;
  const recentBlocksArray = [];
  for (let i = 0; i < 10; i++) {
    recentBlocksArray.push(currentBlock);
    currentBlock--;
  }
  functions.logger.log(`Produced this recentBlocksArray:`, recentBlocksArray);
  return recentBlocksArray;
}

/////// DEPLOYABLE FUNCTIONS ///////

const functionConfig: functions.RuntimeOptions = {
  secrets: [SecretsManagerKeyNames.ALCHEMY_API_KEY_MAINNET]
}

export const onCallFetchRecentBlockNumbers = functions.runWith(functionConfig).https.onCall( async (data, context ): Promise<number[]> => {
  functions.logger.log('fetchRecentBlockNumbers request received with this data', data);
  const lastTenBlockNumbers = generateLastTenBlockNumbers();
  return lastTenBlockNumbers;
});