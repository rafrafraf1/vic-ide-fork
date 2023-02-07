/**
 * A value representing a memory address in the Vic computer.
 * 
 * Must be in the range [0..99]
 */
export type Address = number;

/**
 * A CPU Instruction of the Vic computer
 */
export type Instruction =
    Instruction.ADD |
    Instruction.SUB |
    Instruction.LOAD |
    Instruction.STORE |
    Instruction.GOTO |
    Instruction.GOTOZ |
    Instruction.GOTOP |
    Instruction.READ |
    Instruction.WRITE |
    Instruction.STOP;

export namespace Instruction {
    /**
     * Add memory[xx] value to data register value
     */
    export interface ADD {
        kind: "ADD";
        address: Address;
    }

    /**
     * Subtract memory[xx] value from data register value
     */
    export interface SUB {
        kind: "SUB";
        address: Address;
    }

    /**
     * Load memory[xx] value to data register
     */
    export interface LOAD {
        kind: "LOAD";
        address: Address;
    }

    /**
     * Store data register value in memory[xx]
     */
    export interface STORE {
        kind: "STORE";
        address: Address;
    }

    /**
     * 	Goto execute the memory[xx] instruction
     */
    export interface GOTO {
        kind: "GOTO";
        address: Address;
    }

    /**
     * 	If data reg. value equals to zero, goto execute the memory[xx] instruction
     */
    export interface GOTOZ {
        kind: "GOTOZ";
        address: Address;
    }

    /**
     * 	If data reg. value is greater than zero, goto execute the memory[xx] instruction
     */
    export interface GOTOP {
        kind: "GOTOP";
        address: Address;
    }

    /**
     * 	Read next input value to data register
     */
    export interface READ {
        kind: "READ";
    }

    /**
     * 	Write data register value to output
     */
    export interface WRITE {
        kind: "WRITE";
    }

    /**
     * Stop program execution
     */
    export interface STOP {
        kind: "STOP";
    }
}

/**
 * Convert an Instruction to its numerical code
 * 
 * @returns a number in the range [0..999]
 */
export function assembleInstruction(instruction: Instruction): number {
    switch (instruction.kind) {
        case "ADD":
            return 100 + instruction.address;
        case "SUB":
            return 200 + instruction.address;
        case "LOAD":
            return 300 + instruction.address;
        case "STORE":
            return 400 + instruction.address;
        case "GOTO":
            return 500 + instruction.address;
        case "GOTOZ":
            return 600 + instruction.address;
        case "GOTOP":
            return 700 + instruction.address;
        case "READ":
            return 800;
        case "WRITE":
            return 900;
        case "STOP":
            return 0;
    }
}

/**
 * Parse an instruction from its numerical code
 * 
 * @param value Must be within the range [0..999]
 */
export function parseInstruction(value: number): Instruction {
    const remainder = value % 100;
    switch (value - remainder) {
        case 100:
            return {
                kind: "ADD",
                address: remainder
            };
        case 200:
            return {
                kind: "SUB",
                address: remainder
            };
        case 300:
            return {
                kind: "LOAD",
                address: remainder
            };
        case 400:
            return {
                kind: "STORE",
                address: remainder
            };
        case 500:
            return {
                kind: "GOTO",
                address: remainder
            };
        case 600:
            return {
                kind: "GOTOZ",
                address: remainder
            };
        case 700:
            return {
                kind: "GOTOP",
                address: remainder
            };
        case 800:
            return {
                kind: "READ"
            };
        case 900:
            return {
                kind: "WRITE"
            };
        default:
            return {
                kind: "STOP"
            };
    }
}
