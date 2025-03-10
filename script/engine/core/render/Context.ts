import { Profile } from "./pipeline/Profile.js";
import { Scene } from "./Scene.js";

export interface Context {
    readonly scene: Scene;
    readonly profile: Profile;
}