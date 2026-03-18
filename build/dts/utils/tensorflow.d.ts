/** NODE_START */ import * as tf from "@tensorflow/tfjs"; /** NODE_END */
declare function isTensorFlowAvailable(): boolean;
declare function listTensorflowModels(): Promise<{
    [url: string]: tf.io.ModelArtifactsInfo;
}>;
declare function getTensorFlowModel(url: string): Promise<tf.io.ModelArtifactsInfo | undefined>;
declare function isTensorFlowModelAvailable(url: string): Promise<boolean>;
export { isTensorFlowAvailable, listTensorflowModels, getTensorFlowModel, isTensorFlowModelAvailable, };
