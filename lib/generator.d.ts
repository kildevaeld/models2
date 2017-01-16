import { Description } from './meta';
import { Preprocessor } from './visitor';
export declare class Generator {
    buildins: Description[];
    preprocessor: Preprocessor;
    loadBuildins(): Promise<void>;
    generate(generator: string, files: string[]): Promise<void>;
}
