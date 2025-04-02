import { FileService } from './file-service.service';
import useResourceStore from './store/resource.store';

// Define command handler type
type CommandHandler = (args: Record<string, any>) => Promise<void> | void;

// Interface for command configuration
interface CommandConfig {
    command: string;
    description: string;
    options?: CommandOption[];
    handler: CommandHandler;
}

interface CommandOption {
    name: string;
    description: string;
    type: 'string' | 'boolean' | 'number';
    required?: boolean;
    default?: any;
}

export class CommandService {
    private static commands: Map<string, CommandConfig> = new Map();

    constructor() {
        // Register built-in commands
        this.registerCommand({
            command: 'import',
            description: 'Import data from a file',
            options: [
                {
                    name: 'pdf',
                    description: 'Path to PDF file',
                    type: 'string',
                    required: true
                }
            ],
            handler: async (args) => {
                console.log(`Importing PDF from: ${args.pdf}`);
                const content = await FileService.readFileContent(args.pdf);
                if (!content) return;
                console.log('Pdf File Load Complete! Converting to Images...');
                var contentDataUrl = `data:application/pdf;base64,${content}`;

                useResourceStore.getState().addScoreBook(content);
            }
        });

        this.registerCommand({
            command: 'quit',
            description: 'Exit the application',
            handler: () => {
                console.log('Exiting application...');
                // In browser context, we can't directly exit, so maybe close a panel or navigate
            }
        });
    }

    /**
     * Register a new command
     */
    public registerCommand(config: CommandConfig): void {
        const commandName = config.command.split(' ')[0];
        CommandService.commands.set(commandName, config);
    }

    /**
     * Parse and execute a command string
     */
    public static async parse(cmd: string): Promise<void> {
        try {
            // Parse the command string
            console.log('CommandService.parse(): incoming command: ', cmd);
            const tokens = this.tokenize(cmd);

            if (tokens.length === 0) return;

            const commandName = tokens[0];
            const commandConfig = this.commands.get(commandName);

            if (!commandConfig) {
                console.error(`Unknown command: ${commandName}`);
                return;
            }

            const args = this.parseArgs(
                tokens.slice(1),
                commandConfig.options || []
            );

            // Validate required options
            const missingRequired = (commandConfig.options || [])
                .filter((opt) => opt.required && args[opt.name] === undefined)
                .map((opt) => opt.name);

            if (missingRequired.length > 0) {
                console.error(
                    `Missing required options: ${missingRequired.join(', ')}`
                );
                return;
            }

            // Execute the command handler
            await commandConfig.handler(args);
        } catch (error) {
            console.error('Command parsing error:', error);
        }
    }

    /**
     * Tokenize a command string respecting quotes
     */
    private static tokenize(input: string): string[] {
        const tokens: string[] = [];
        let currentToken = '';
        let inQuotes = false;

        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            if (char === '"' || char === "'") {
                inQuotes = !inQuotes; // Toggle quote state
                if (!inQuotes) {
                    // Closing quote: push the completed token
                    tokens.push(currentToken);
                    currentToken = '';
                }
                continue;
            }

            if (char === ' ' && !inQuotes) {
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
                continue;
            }

            currentToken += char;
        }

        // Push any remaining token (e.g., last word without a trailing space)
        if (currentToken) {
            tokens.push(currentToken);
        }

        return tokens;
    }

    /**
     * Parse arguments into a key-value object
     */
    private static parseArgs(
        args: string[],
        options: CommandOption[]
    ): Record<string, any> {
        const result: Record<string, any> = {};

        // Set default values
        options.forEach((opt) => {
            if (opt.default !== undefined) {
                result[opt.name] = opt.default;
            }
        });

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];

            if (arg.startsWith('--')) {
                const name = arg.substring(2);
                const option = options.find((o) => o.name === name);

                if (!option) {
                    console.warn(`Unknown option: ${name}`);
                    continue;
                }

                if (option.type === 'boolean') {
                    result[name] = true;
                } else if (
                    i + 1 < args.length &&
                    !args[i + 1].startsWith('--')
                ) {
                    // Next token is the value
                    const value = args[++i];
                    result[name] =
                        option.type === 'number' ? Number(value) : value;
                } else {
                    console.warn(`Missing value for option: ${name}`);
                }
            }
        }

        return result;
    }

    /**
     * Get list of all available commands
     */
    public getAvailableCommands(): string[] {
        return Array.from(CommandService.commands.keys());
    }

    /**
     * Get help text for all commands
     */
    public getHelpText(): string {
        const helpLines = ['Available Commands:'];

        CommandService.commands.forEach((config, command) => {
            helpLines.push(`  ${command} - ${config.description}`);

            if (config.options && config.options.length > 0) {
                helpLines.push('    Options:');
                config.options.forEach((opt) => {
                    const requiredText = opt.required ? ' (required)' : '';
                    const defaultText =
                        opt.default !== undefined
                            ? ` (default: ${opt.default})`
                            : '';
                    helpLines.push(
                        `      --${opt.name}: ${opt.description}${requiredText}${defaultText}`
                    );
                });
            }
        });

        return helpLines.join('\n');
    }
}
