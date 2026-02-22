import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface GameInput {
    title: string;
    tags: Array<string>;
    description: string;
    platform: string;
    trending: boolean;
    coverImage?: ExternalBlob;
    sport: string;
    franchise: string;
    genre: string;
    isNew: boolean;
    releaseYear: bigint;
    developer: string;
}
export interface Game {
    id: string;
    title: string;
    tags: Array<string>;
    description: string;
    platform: string;
    trending: boolean;
    playCount: bigint;
    coverImage?: ExternalBlob;
    sport: string;
    franchise: string;
    genre: string;
    rating: number;
    isNew: boolean;
    releaseYear: bigint;
    developer: string;
}
export interface Comment {
    id: bigint;
    content: string;
    gameId: string;
    author: Principal;
    timestamp: bigint;
}
export interface UserProfileView {
    favorites: Array<string>;
    name: string;
    playCounts: Array<[string, bigint]>;
    recentlyPlayed: Array<string>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(gameId: string, content: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createGame(input: GameInput): Promise<string>;
    deleteComment(commentId: bigint): Promise<void>;
    deleteGame(gameId: string): Promise<void>;
    getAllComments(): Promise<Array<Comment>>;
    getCallerUserProfile(): Promise<UserProfileView | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGame(gameId: string): Promise<Game>;
    getGameComments(gameId: string): Promise<Array<Comment>>;
    getGameRating(gameId: string): Promise<number>;
    getLeaderboard(limit: bigint): Promise<Array<[Principal, bigint]>>;
    getUserProfile(user: Principal): Promise<UserProfileView | null>;
    isCallerAdmin(): Promise<boolean>;
    listGames(): Promise<Array<Game>>;
    playGame(gameId: string): Promise<void>;
    rateGame(gameId: string, stars: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfileView): Promise<void>;
    updateComment(commentId: bigint, content: string): Promise<void>;
    updateFavorites(gameId: string, add: boolean): Promise<void>;
    updateGame(gameId: string, input: GameInput): Promise<void>;
}
